#!/usr/bin/env python3
"""
Test Analyzer - Análise de Resultados e Tendências
Inspirado no Ekyte - Analytics e insights sobre execução de testes

Funcionalidades:
- Análise de tendências de failures
- Identificação de padrões
- Previsão de duração
- Recomendações de otimização
"""

import sys
import sqlite3
import json
import statistics
from pathlib import Path
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
from collections import defaultdict
import argparse

# Fix Windows console encoding
try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')
except:
    pass


@dataclass
class TestMetrics:
    """Métricas de um teste"""
    test_id: str
    total_runs: int
    success_rate: float
    avg_duration: float
    min_duration: float
    max_duration: float
    duration_std: float
    trend: str  # improving, stable, degrading
    last_status: str
    last_run: datetime


@dataclass
class SuiteMetrics:
    """Métricas de uma suite"""
    suite_name: str
    total_tests: int
    avg_duration: float
    success_rate: float
    total_runs: int


class TestAnalyzer:
    """Analisador de resultados de testes"""

    def __init__(self, storage_path: Path):
        self.storage_path = storage_path
        self.db_path = storage_path / "test_history.db"

    def analyze_test(self, test_id: str, days: int = 30) -> Optional[TestMetrics]:
        """Analisa métricas de um teste específico"""
        conn = sqlite3.connect(str(self.db_path))
        cursor = conn.cursor()

        cursor.execute("""
            SELECT status, duration, timestamp
            FROM test_runs
            WHERE test_id = ? AND timestamp > datetime('now', '-{} days')
            ORDER BY timestamp DESC
        """.format(days), (test_id,))

        runs = cursor.fetchall()
        conn.close()

        if not runs:
            return None

        statuses = [r[0] for r in runs]
        durations = [r[1] for r in runs if r[1] is not None]
        timestamps = [datetime.fromisoformat(r[2]) for r in runs]

        # Métricas básicas
        total_runs = len(runs)
        success_count = sum(1 for s in statuses if s in ["passed", "flaky"])
        success_rate = (success_count / total_runs) * 100 if total_runs > 0 else 0

        # Métricas de duração
        if durations:
            avg_duration = statistics.mean(durations)
            min_duration = min(durations)
            max_duration = max(durations)
            duration_std = statistics.stdev(durations) if len(durations) > 1 else 0
        else:
            avg_duration = min_duration = max_duration = duration_std = 0

        # Análise de tendência
        trend = self._calculate_trend(statuses, durations)

        return TestMetrics(
            test_id=test_id,
            total_runs=total_runs,
            success_rate=success_rate,
            avg_duration=avg_duration,
            min_duration=min_duration,
            max_duration=max_duration,
            duration_std=duration_std,
            trend=trend,
            last_status=statuses[0] if statuses else "unknown",
            last_run=timestamps[0] if timestamps else None
        )

    def _calculate_trend(self, statuses: List[str], durations: List[float]) -> str:
        """Calcula tendência do teste"""
        if len(statuses) < 5:
            return "insufficient_data"

        # Divide em duas metades
        half = len(statuses) // 2
        recent = statuses[:half]
        older = statuses[half:]

        # Taxa de sucesso
        recent_success = sum(1 for s in recent if s == "passed") / len(recent) if recent else 0
        older_success = sum(1 for s in older if s == "passed") / len(older) if older else 0

        # Duração
        if len(durations) >= 10:
            recent_durations = durations[:half]
            older_durations = durations[half:]
            recent_avg = statistics.mean(recent_durations)
            older_avg = statistics.mean(older_durations)
            duration_change = (recent_avg - older_avg) / older_avg if older_avg > 0 else 0
        else:
            duration_change = 0

        # Determina tendência
        if recent_success > older_success + 0.1:
            return "improving"
        elif recent_success < older_success - 0.1:
            return "degrading"
        elif duration_change > 0.2:  # 20% mais lento
            return "slower"
        elif duration_change < -0.2:  # 20% mais rápido
            return "faster"
        else:
            return "stable"

    def analyze_suite(self, suite_name: str, days: int = 30) -> Optional[SuiteMetrics]:
        """Analisa métricas de uma suite"""
        conn = sqlite3.connect(str(self.db_path))
        cursor = conn.cursor()

        cursor.execute("""
            SELECT test_id, status, duration
            FROM test_runs tr
            JOIN test_metadata tm ON tr.test_id = tm.test_id
            WHERE tm.suite = ? AND timestamp > datetime('now', '-{} days')
        """.format(days), (suite_name,))

        runs = cursor.fetchall()
        conn.close()

        if not runs:
            return None

        # Agrupa por teste
        test_data = defaultdict(lambda: {"statuses": [], "durations": []})
        for row in runs:
            test_id, status, duration = row
            test_data[test_id]["statuses"].append(status)
            if duration:
                test_data[test_id]["durations"].append(duration)

        total_tests = len(test_data)

        # Calcula taxa de sucesso geral
        all_statuses = []
        all_durations = []
        for data in test_data.values():
            all_statuses.extend(data["statuses"])
            all_durations.extend(data["durations"])

        success_count = sum(1 for s in all_statuses if s == "passed")
        success_rate = (success_count / len(all_statuses)) * 100 if all_statuses else 0

        avg_duration = statistics.mean(all_durations) if all_durations else 0

        return SuiteMetrics(
            suite_name=suite_name,
            total_tests=total_tests,
            avg_duration=avg_duration,
            success_rate=success_rate,
            total_runs=len(all_statuses)
        )

    def generate_trend_report(self, days: int = 30) -> Dict:
        """Gera relatório de tendências"""
        conn = sqlite3.connect(str(self.db_path))
        cursor = conn.cursor()

        # Estatísticas diárias
        cursor.execute("""
            SELECT
                date(timestamp) as day,
                COUNT(*) as runs,
                SUM(CASE WHEN status = 'passed' THEN 1 ELSE 0 END) as passes,
                AVG(duration) as avg_duration
            FROM test_runs
            WHERE timestamp > datetime('now', '-{} days')
            GROUP BY date(timestamp)
            ORDER BY day
        """.format(days))

        daily_stats = cursor.fetchall()

        # Análise por suite
        cursor.execute("""
            SELECT
                tm.suite,
                COUNT(*) as runs,
                AVG(CASE WHEN tr.status = 'passed' THEN 1.0 ELSE 0.0 END) as success_rate
            FROM test_runs tr
            JOIN test_metadata tm ON tr.test_id = tm.test_id
            WHERE timestamp > datetime('now', '-{} days')
            GROUP BY tm.suite
        """.format(days))

        suite_stats = cursor.fetchall()
        conn.close()

        # Calcula tendências
        if len(daily_stats) >= 7:
            recent = daily_stats[-7:]
            older = daily_stats[-14:-7] if len(daily_stats) >= 14 else daily_stats[:-7]

            recent_success = sum(r[2] for r in recent) / sum(r[1] for r in recent) * 100 if recent else 0
            older_success = sum(r[2] for r in older) / sum(r[1] for r in older) * 100 if older else 0

            recent_duration = statistics.mean([r[3] for r in recent if r[3]])
            older_duration = statistics.mean([r[3] for r in older if r[3]])

            success_trend = recent_success - older_success
            duration_trend = ((recent_duration - older_duration) / older_duration * 100) if older_duration else 0
        else:
            success_trend = 0
            duration_trend = 0

        return {
            "period_days": days,
            "daily_trend": [
                {
                    "date": row[0],
                    "total_runs": row[1],
                    "passes": row[2],
                    "success_rate": round((row[2] / row[1]) * 100, 1) if row[1] else 0,
                    "avg_duration": round(row[3], 2) if row[3] else 0
                }
                for row in daily_stats
            ],
            "suite_performance": [
                {
                    "suite": row[0],
                    "total_runs": row[1],
                    "success_rate": round(row[2] * 100, 1)
                }
                for row in suite_stats
            ],
            "trends": {
                "success_change_7d": round(success_trend, 2),
                "duration_change_7d": round(duration_trend, 2),
                "direction": "improving" if success_trend > 0 else "degrading" if success_trend < -5 else "stable"
            }
        }

    def find_slow_tests(self, limit: int = 10, days: int = 30) -> List[Dict]:
        """Encontra os testes mais lentos"""
        conn = sqlite3.connect(str(self.db_path))
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                test_id,
                AVG(duration) as avg_duration,
                COUNT(*) as runs
            FROM test_runs
            WHERE timestamp > datetime('now', '-{} days')
            AND duration IS NOT NULL
            GROUP BY test_id
            HAVING runs >= 3
            ORDER BY avg_duration DESC
            LIMIT ?
        """.format(days), (limit,))

        results = cursor.fetchall()
        conn.close()

        return [
            {
                "test_id": row[0],
                "avg_duration": round(row[1], 2),
                "runs": row[2]
            }
            for row in results
        ]

    def find_problematic_tests(self, days: int = 30) -> List[Dict]:
        """Encontra testes problemáticos (falhas frequentes)"""
        conn = sqlite3.connect(str(self.db_path))
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                test_id,
                COUNT(*) as runs,
                SUM(CASE WHEN status = 'passed' THEN 0 ELSE 1 END) as failures,
                AVG(CASE WHEN status = 'passed' THEN 1.0 ELSE 0.0 END) as success_rate
            FROM test_runs
            WHERE timestamp > datetime('now', '-{} days')
            GROUP BY test_id
            HAVING runs >= 5
            ORDER BY success_rate ASC
            LIMIT 20
        """.format(days))

        results = cursor.fetchall()
        conn.close()

        return [
            {
                "test_id": row[0],
                "runs": row[1],
                "failures": row[2],
                "success_rate": round(row[3] * 100, 1)
            }
            for row in results if row[3] < 0.9  # Menos de 90% de sucesso
        ]


def main():
    parser = argparse.ArgumentParser(
        description="Test Analyzer - GrowthOS",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python test-analyzer.py --test-id=auth-login
  python test-analyzer.py --suite=auth
  python test-analyzer.py --trend-report
  python test-analyzer.py --slow-tests
  python test-analyzer.py --problematic
        """
    )

    parser.add_argument("--storage", default=".agent/test-engine/storage")
    parser.add_argument("--days", type=int, default=30)
    parser.add_argument("--test-id", help="Analisar teste específico")
    parser.add_argument("--suite", help="Analisar suite")
    parser.add_argument("--trend-report", action="store_true", help="Relatório de tendências")
    parser.add_argument("--slow-tests", action="store_true", help="Testes mais lentos")
    parser.add_argument("--problematic", action="store_true", help="Testes problemáticos")

    args = parser.parse_args()

    storage_path = Path(args.storage).resolve()
    analyzer = TestAnalyzer(storage_path)

    print(f"📊 Test Analyzer - GrowthOS")
    print(f"{'='*70}\n")

    if args.test_id:
        metrics = analyzer.analyze_test(args.test_id, args.days)
        if metrics:
            print(f"Métricas do teste: {args.test_id}")
            print(f"  Total runs: {metrics.total_runs}")
            print(f"  Success rate: {metrics.success_rate:.1f}%")
            print(f"  Avg duration: {metrics.avg_duration:.2f}s")
            print(f"  Duration range: {metrics.min_duration:.2f}s - {metrics.max_duration:.2f}s")
            print(f"  Trend: {metrics.trend}")
            print(f"  Last status: {metrics.last_status}")
        else:
            print("Nenhum dado encontrado para este teste")

    elif args.suite:
        metrics = analyzer.analyze_suite(args.suite, args.days)
        if metrics:
            print(f"Métricas da suite: {args.suite}")
            print(f"  Total tests: {metrics.total_tests}")
            print(f"  Total runs: {metrics.total_runs}")
            print(f"  Success rate: {metrics.success_rate:.1f}%")
            print(f"  Avg duration: {metrics.avg_duration:.2f}s")
        else:
            print("Nenhum dado encontrado para esta suite")

    elif args.trend_report:
        report = analyzer.generate_trend_report(args.days)
        print("Relatório de Tendências")
        print(json.dumps(report, indent=2))

    elif args.slow_tests:
        slow = analyzer.find_slow_tests(limit=10, days=args.days)
        print("Testes Mais Lentos:")
        for i, test in enumerate(slow, 1):
            print(f"  {i}. {test['test_id']}: {test['avg_duration']}s ({test['runs']} runs)")

    elif args.problematic:
        problematic = analyzer.find_problematic_tests(args.days)
        print("Testes Problemáticos:")
        for test in problematic:
            print(f"  - {test['test_id']}: {test['success_rate']}% ({test['failures']}/{test['runs']} falhas)")

    else:
        parser.print_help()


if __name__ == "__main__":
    main()
