#!/usr/bin/env python3
"""
Flaky Test Detector - Sistema de Detecção de Testes Instáveis
Inspirado no Ekyte - Detecta e gerencia testes flaky automaticamente

Algoritmo:
1. Analisa histórico de execuções
2. Calcula score de flakiness
3. Quarentena testes problemáticos
4. Reporta tendências
"""

import sys
import sqlite3
import json
import os
import statistics
from pathlib import Path
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
import argparse

# Fix Windows console encoding
try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')
except:
    pass


@dataclass
class FlakyAnalysis:
    """Resultado da análise de flakiness"""
    test_id: str
    flakiness_score: float  # 0-100
    total_runs: int
    pass_count: int
    fail_count: int
    error_count: int
    status_variations: int  # Mudanças de status
    avg_duration: float
    duration_variance: float
    last_failure: Optional[datetime]
    consecutive_passes: int
    consecutive_failures: int
    recommendation: str


class FlakyDetector:
    """Detector de testes instáveis - Algoritmo Ekyte-like"""

    def __init__(self, storage_path: Path):
        self.storage_path = storage_path
        self.db_path = storage_path / "test_history.db"

        # Thresholds
        self.QUARANTINE_THRESHOLD = 70  # Score para quarentena
        self.SUSPICIOUS_THRESHOLD = 40  # Score para marcação
        self.MIN_RUNS = 5  # Mínimo de execuções para análise

    def analyze_all(self, days: int = 30) -> List[FlakyAnalysis]:
        """Analisa todos os testes do histórico"""
        print(f"🔍 Analisando histórico dos últimos {days} dias...")

        conn = sqlite3.connect(str(self.db_path))
        cursor = conn.cursor()

        # Busca todos os testes distintos
        cursor.execute("""
            SELECT DISTINCT test_id FROM test_runs
            WHERE timestamp > datetime('now', '-{} days')
        """.format(days))

        test_ids = [row[0] for row in cursor.fetchall()]
        conn.close()

        print(f"   Encontrados {len(test_ids)} testes para análise")

        results = []
        for test_id in test_ids:
            analysis = self._analyze_test(test_id, days)
            if analysis:
                results.append(analysis)

        # Ordena por flakiness score
        results.sort(key=lambda x: x.flakiness_score, reverse=True)

        return results

    def analyze_test(self, test_id: str, days: int = 30) -> Optional[FlakyAnalysis]:
        """Analisa um teste específico"""
        return self._analyze_test(test_id, days)

    def _analyze_test(self, test_id: str, days: int) -> Optional[FlakyAnalysis]:
        """Análise detalhada de um teste"""
        conn = sqlite3.connect(str(self.db_path))
        cursor = conn.cursor()

        # Busca histórico
        cursor.execute("""
            SELECT status, duration, timestamp
            FROM test_runs
            WHERE test_id = ? AND timestamp > datetime('now', '-{} days')
            ORDER BY timestamp DESC
        """.format(days), (test_id,))

        runs = cursor.fetchall()
        conn.close()

        if len(runs) < self.MIN_RUNS:
            return None

        # Análise estatística
        statuses = [r[0] for r in runs]
        durations = [r[1] for r in runs if r[1] is not None]
        timestamps = [datetime.fromisoformat(r[2]) for r in runs]

        # Contadores
        pass_count = statuses.count("passed")
        fail_count = statuses.count("failed")
        error_count = statuses.count("error")
        flaky_count = statuses.count("flaky")
        total_runs = len(runs)

        # Variações de status (mudanças)
        status_variations = sum(
            1 for i in range(len(statuses) - 1)
            if statuses[i] != statuses[i + 1]
        )

        # Estatísticas de duração
        if durations:
            avg_duration = statistics.mean(durations)
            duration_variance = statistics.stdev(durations) if len(durations) > 1 else 0
        else:
            avg_duration = 0
            duration_variance = 0

        # Última falha
        last_failure = None
        for i, status in enumerate(statuses):
            if status in ["failed", "error"]:
                last_failure = timestamps[i]
                break

        # Sequências
        consecutive_passes = 0
        consecutive_failures = 0
        for status in statuses:
            if status == "passed":
                consecutive_passes += 1
                consecutive_failures = 0
            elif status in ["failed", "error"]:
                consecutive_failures += 1
                consecutive_passes = 0
            else:
                break

        # Cálculo do score de flakiness (0-100)
        flakiness_score = self._calculate_flakiness_score(
            total_runs, pass_count, fail_count, error_count,
            status_variations, duration_variance, consecutive_passes
        )

        # Recomendação
        recommendation = self._generate_recommendation(
            flakiness_score, consecutive_failures, last_failure,
            fail_count, total_runs
        )

        return FlakyAnalysis(
            test_id=test_id,
            flakiness_score=flakiness_score,
            total_runs=total_runs,
            pass_count=pass_count,
            fail_count=fail_count,
            error_count=error_count,
            status_variations=status_variations,
            avg_duration=avg_duration,
            duration_variance=duration_variance,
            last_failure=last_failure,
            consecutive_passes=consecutive_passes,
            consecutive_failures=consecutive_failures,
            recommendation=recommendation
        )

    def _calculate_flakiness_score(
        self, total_runs: int, pass_count: int, fail_count: int,
        error_count: int, status_variations: int, duration_variance: float,
        consecutive_passes: int
    ) -> float:
        """
        Calcula score de flakiness (0-100)

        Fatores:
        - Taxa de falha (30%)
        - Variação de status (30%)
        - Falhas recentes (20%)
        - Variância de duração (10%)
        - Estabilidade recente (10%)
        """
        if total_runs == 0:
            return 0.0

        # Taxa de falha (inverte para score alto = flaky)
        failure_rate = (fail_count + error_count) / total_runs
        failure_score = min(failure_rate * 100 * 1.5, 50)  # Max 50 pontos

        # Variação de status (fluctuação)
        variation_rate = status_variations / (total_runs - 1) if total_runs > 1 else 0
        variation_score = min(variation_rate * 100, 30)  # Max 30 pontos

        # Falhas recentes (últimas 3 runs)
        recent_failure_score = 0
        if fail_count > 0:
            recent_failure_score = min(fail_count * 5, 20)  # Max 20 pontos

        # Variância de duração (alta variância = instável)
        duration_score = 0
        if duration_variance > 5:  # Se variância > 5s
            duration_score = min(duration_variance * 2, 10)

        # Estabilidade recente
        stability_score = 0
        if consecutive_passes >= 5:
            stability_score = -10  # Bônus de estabilidade
        elif consecutive_failures >= 3:
            stability_score = 10  # Penalidade

        total_score = (
            failure_score +
            variation_score +
            recent_failure_score +
            duration_score +
            stability_score
        )

        return max(0, min(100, total_score))

    def _generate_recommendation(
        self, score: float, consecutive_failures: int,
        last_failure: Optional[datetime], fail_count: int, total_runs: int
    ) -> str:
        """Gera recomendação baseada na análise"""
        if score >= self.QUARANTINE_THRESHOLD:
            return "QUARANTINE: Isolar teste e investigar causa raiz"
        elif score >= self.SUSPICIOUS_THRESHOLD:
            if consecutive_failures >= 3:
                return "URGENT: Falhas consecutivas, revisar imediatamente"
            return "MONITOR: Acompanhar nas próximas execuções"
        elif fail_count == 0:
            return "STABLE: Teste estável"
        else:
            return "ACCEPTABLE: Taxa de falha dentro do esperado"

    def quarantine_tests(self, test_ids: List[str], reason: str = "flaky"):
        """Coloca testes em quarentena"""
        conn = sqlite3.connect(str(self.db_path))
        cursor = conn.cursor()

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS quarantined_tests (
                test_id TEXT PRIMARY KEY,
                quarantined_at TEXT,
                reason TEXT,
                flakiness_score REAL
            )
        """)

        for test_id in test_ids:
            cursor.execute("""
                INSERT OR REPLACE INTO quarantined_tests
                (test_id, quarantined_at, reason, flakiness_score)
                VALUES (?, datetime('now'), ?, ?)
            """, (test_id, reason, 0))

        conn.commit()
        conn.close()

        print(f"🚫 {len(test_ids)} testes colocados em quarentena")

    def get_quarantined_tests(self) -> List[Dict]:
        """Obtém lista de testes em quarentena"""
        conn = sqlite3.connect(str(self.db_path))
        cursor = conn.cursor()

        cursor.execute("""
            SELECT test_id, quarantined_at, reason, flakiness_score
            FROM quarantined_tests
            ORDER BY quarantined_at DESC
        """)

        results = [
            {
                "test_id": row[0],
                "quarantined_at": row[1],
                "reason": row[2],
                "flakiness_score": row[3]
            }
            for row in cursor.fetchall()
        ]

        conn.close()
        return results

    def unquarantine_test(self, test_id: str):
        """Remove teste da quarentena"""
        conn = sqlite3.connect(str(self.db_path))
        cursor = conn.cursor()

        cursor.execute(
            "DELETE FROM quarantined_tests WHERE test_id = ?",
            (test_id,)
        )

        conn.commit()
        conn.close()
        print(f"✅ Teste {test_id} removido da quarentena")

    def generate_report(self, analyses: List[FlakyAnalysis]) -> Dict:
        """Gera relatório de flakiness"""
        if not analyses:
            return {"message": "Nenhum dado para análise"}

        total_tests = len(analyses)
        quarantine_count = sum(1 for a in analyses if a.flakiness_score >= self.QUARANTINE_THRESHOLD)
        suspicious_count = sum(1 for a in analyses if self.SUSPICIOUS_THRESHOLD <= a.flakiness_score < self.QUARANTINE_THRESHOLD)
        stable_count = total_tests - quarantine_count - suspicious_count

        avg_flakiness = statistics.mean([a.flakiness_score for a in analyses])

        # Top flaky
        top_flaky = [
            {
                "test_id": a.test_id,
                "score": round(a.flakiness_score, 2),
                "pass_rate": round(a.pass_count / a.total_runs * 100, 1),
                "recommendation": a.recommendation
            }
            for a in analyses[:10]
        ]

        return {
            "summary": {
                "total_tests": total_tests,
                "quarantine": quarantine_count,
                "suspicious": suspicious_count,
                "stable": stable_count,
                "avg_flakiness_score": round(avg_flakiness, 2)
            },
            "distribution": {
                "critical": sum(1 for a in analyses if a.flakiness_score >= 80),
                "high": sum(1 for a in analyses if 60 <= a.flakiness_score < 80),
                "medium": sum(1 for a in analyses if 40 <= a.flakiness_score < 60),
                "low": sum(1 for a in analyses if a.flakiness_score < 40)
            },
            "top_flaky": top_flaky,
            "quarantine_candidates": [
                a.test_id for a in analyses
                if a.flakiness_score >= self.QUARANTINE_THRESHOLD
            ]
        }


def main():
    parser = argparse.ArgumentParser(
        description="Flaky Test Detector - GrowthOS",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python flaky-detector.py --report
  python flaky-detector.py --test-id=auth-login
  python flaky-detector.py --quarantine=test-1,test-2
  python flaky-detector.py --list-quarantined
  python flaky-detector.py --days=14
        """
    )

    parser.add_argument("--storage", default=".agent/test-engine/storage",
                       help="Caminho do storage")
    parser.add_argument("--days", type=int, default=30,
                       help="Dias de histórico para análise")
    parser.add_argument("--report", action="store_true",
                       help="Gerar relatório completo")
    parser.add_argument("--test-id", help="Analisar teste específico")
    parser.add_argument("--quarantine", help="IDs de testes para quarentena (separados por vírgula)")
    parser.add_argument("--unquarantine", help="Remover teste da quarentena")
    parser.add_argument("--list-quarantined", action="store_true",
                       help="Listar testes em quarentena")

    args = parser.parse_args()

    storage_path = Path(args.storage).resolve()
    detector = FlakyDetector(storage_path)

    print(f"🧪 Flaky Test Detector - GrowthOS")
    print(f"Storage: {storage_path}")
    print(f"{'='*70}\n")

    if args.test_id:
        print(f"Analisando teste: {args.test_id}")
        analysis = detector.analyze_test(args.test_id, args.days)
        if analysis:
            print(f"\nScore de Flakiness: {analysis.flakiness_score:.1f}/100")
            print(f"Total Runs: {analysis.total_runs}")
            print(f"Pass: {analysis.pass_count} | Fail: {analysis.fail_count} | Error: {analysis.error_count}")
            print(f"Variações de Status: {analysis.status_variations}")
            print(f"Duração Média: {analysis.avg_duration:.2f}s")
            print(f"Recomendação: {analysis.recommendation}")
        else:
            print("Dados insuficientes para análise")

    elif args.report:
        print("Gerando relatório de flakiness...\n")
        analyses = detector.analyze_all(args.days)
        report = detector.generate_report(analyses)

        print("📊 RELATÓRIO DE FLAKINESS")
        print("="*70)
        print(f"\nResumo:")
        print(f"  Total de testes analisados: {report['summary']['total_tests']}")
        print(f"  Em quarentena: {report['summary']['quarantine']}")
        print(f"  Suspeitos: {report['summary']['suspicious']}")
        print(f"  Estáveis: {report['summary']['stable']}")
        print(f"  Score médio de flakiness: {report['summary']['avg_flakiness_score']:.1f}")

        print(f"\nDistribuição:")
        for level, count in report['distribution'].items():
            print(f"  {level.capitalize()}: {count}")

        if report['top_flaky']:
            print(f"\nTop 10 Testes Flaky:")
            for i, test in enumerate(report['top_flaky'], 1):
                print(f"  {i}. {test['test_id']}")
                print(f"     Score: {test['score']} | Pass Rate: {test['pass_rate']}%")
                print(f"     → {test['recommendation']}")

        # Output JSON
        print(f"\n{'='*70}")
        print("JSON OUTPUT:")
        print(json.dumps(report, indent=2))

    elif args.quarantine:
        test_ids = args.quarantine.split(",")
        detector.quarantine_tests(test_ids)

    elif args.unquarantine:
        detector.unquarantine_test(args.unquarantine)

    elif args.list_quarantined:
        quarantined = detector.get_quarantined_tests()
        print(f"Testes em quarentena: {len(quarantined)}")
        for qt in quarantined:
            print(f"  - {qt['test_id']} ({qt['quarantined_at']})")

    else:
        parser.print_help()


if __name__ == "__main__":
    main()
