#!/usr/bin/env python3
"""
Coverage Reporter - Relatórios Avançados de Cobertura
Inspirado no Ekyte - Análise de cobertura com tendências e insights

Funcionalidades:
- Parse de relatórios de cobertura (lcov, cobertura, etc.)
- Tracking histórico de cobertura
- Análise de gaps
- Recomendações de cobertura
"""

import sys
import sqlite3
import json
import re
import xml.etree.ElementTree as ET
from pathlib import Path
from datetime import datetime
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
class CoverageData:
    """Dados de cobertura"""
    lines_covered: int
    lines_total: int
    branches_covered: int
    branches_total: int
    functions_covered: int
    functions_total: int
    timestamp: datetime
    commit_hash: Optional[str]

    @property
    def lines_percentage(self) -> float:
        return (self.lines_covered / self.lines_total * 100) if self.lines_total > 0 else 0

    @property
    def branches_percentage(self) -> float:
        return (self.branches_covered / self.branches_total * 100) if self.branches_total > 0 else 0

    @property
    def functions_percentage(self) -> float:
        return (self.functions_covered / self.functions_total * 100) if self.functions_total > 0 else 0


@dataclass
class FileCoverage:
    """Cobertura por arquivo"""
    file_path: str
    lines_covered: int
    lines_total: int
    branches_covered: int
    branches_total: int

    @property
    def percentage(self) -> float:
        return (self.lines_covered / self.lines_total * 100) if self.lines_total > 0 else 0


class CoverageReporter:
    """Reporter de cobertura de código"""

    def __init__(self, storage_path: Path, project_path: Path):
        self.storage_path = storage_path
        self.project_path = project_path
        self.db_path = storage_path / "coverage_history.db"
        self._init_db()

    def _init_db(self):
        """Inicializa banco de dados de cobertura"""
        conn = sqlite3.connect(str(self.db_path))
        cursor = conn.cursor()

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS coverage_snapshots (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT,
                commit_hash TEXT,
                lines_covered INTEGER,
                lines_total INTEGER,
                branches_covered INTEGER,
                branches_total INTEGER,
                functions_covered INTEGER,
                functions_total INTEGER
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS file_coverage (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                snapshot_id INTEGER,
                file_path TEXT,
                lines_covered INTEGER,
                lines_total INTEGER,
                FOREIGN KEY (snapshot_id) REFERENCES coverage_snapshots(id)
            )
        """)

        conn.commit()
        conn.close()

    def parse_lcov(self, lcov_path: Path) -> CoverageData:
        """Parse de arquivo LCOV"""
        lines_covered = 0
        lines_total = 0
        branches_covered = 0
        branches_total = 0
        functions_covered = 0
        functions_total = 0

        with open(lcov_path, 'r') as f:
            content = f.read()

        # Parse LCOV format
        for line in content.split('\n'):
            if line.startswith('LF:'):
                lines_total = int(line[3:])
            elif line.startswith('LH:'):
                lines_covered = int(line[3:])
            elif line.startswith('BRF:'):
                branches_total = int(line[4:])
            elif line.startswith('BRH:'):
                branches_covered = int(line[4:])
            elif line.startswith('FNF:'):
                functions_total = int(line[4:])
            elif line.startswith('FNH:'):
                functions_covered = int(line[4:])

        return CoverageData(
            lines_covered=lines_covered,
            lines_total=lines_total,
            branches_covered=branches_covered,
            branches_total=branches_total,
            functions_covered=functions_covered,
            functions_total=functions_total,
            timestamp=datetime.now(),
            commit_hash=self._get_commit_hash()
        )

    def parse_cobertura(self, xml_path: Path) -> CoverageData:
        """Parse de arquivo Cobertura XML"""
        tree = ET.parse(xml_path)
        root = tree.getroot()

        # Encontra atributos de cobertura
        lines_valid = int(root.get('lines-valid', 0))
        lines_covered = int(root.get('lines-covered', 0))
        branches_valid = int(root.get('branches-valid', 0))
        branches_covered_val = int(root.get('branches-covered', 0))

        return CoverageData(
            lines_covered=lines_covered,
            lines_total=lines_valid,
            branches_covered=branches_covered_val,
            branches_total=branches_valid,
            functions_covered=0,  # Cobertura não reporta funções de forma padrão
            functions_total=0,
            timestamp=datetime.now(),
            commit_hash=self._get_commit_hash()
        )

    def parse_jest_json(self, json_path: Path) -> CoverageData:
        """Parse de relatório JSON do Jest"""
        with open(json_path, 'r') as f:
            data = json.load(f)

        totals = data.get('total', {})

        return CoverageData(
            lines_covered=totals.get('linesCovered', 0),
            lines_total=totals.get('linesTotal', 0),
            branches_covered=totals.get('branchesCovered', 0),
            branches_total=totals.get('branchesTotal', 0),
            functions_covered=totals.get('functionsCovered', 0),
            functions_total=totals.get('functionsTotal', 0),
            timestamp=datetime.now(),
            commit_hash=self._get_commit_hash()
        )

    def _get_commit_hash(self) -> Optional[str]:
        """Obtém hash do commit atual"""
        try:
            import subprocess
            result = subprocess.run(
                ["git", "rev-parse", "--short", "HEAD"],
                capture_output=True,
                text=True,
                cwd=str(self.project_path)
            )
            return result.stdout.strip()
        except:
            return None

    def save_coverage(self, coverage: CoverageData):
        """Salva snapshot de cobertura"""
        conn = sqlite3.connect(str(self.db_path))
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO coverage_snapshots
            (timestamp, commit_hash, lines_covered, lines_total,
             branches_covered, branches_total, functions_covered, functions_total)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            coverage.timestamp.isoformat(),
            coverage.commit_hash,
            coverage.lines_covered,
            coverage.lines_total,
            coverage.branches_covered,
            coverage.branches_total,
            coverage.functions_covered,
            coverage.functions_total
        ))

        conn.commit()
        conn.close()

    def get_coverage_trend(self, days: int = 30) -> List[Dict]:
        """Obtém tendência de cobertura"""
        conn = sqlite3.connect(str(self.db_path))
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                date(timestamp) as day,
                AVG(lines_covered * 100.0 / lines_total) as line_coverage,
                AVG(branches_covered * 100.0 / branches_total) as branch_coverage
            FROM coverage_snapshots
            WHERE timestamp > datetime('now', '-{} days')
            GROUP BY date(timestamp)
            ORDER BY day
        """.format(days))

        results = cursor.fetchall()
        conn.close()

        return [
            {
                "date": row[0],
                "line_coverage": round(row[1], 2) if row[1] else 0,
                "branch_coverage": round(row[2], 2) if row[2] else 0
            }
            for row in results
        ]

    def generate_report(self) -> Dict:
        """Gera relatório completo de cobertura"""
        conn = sqlite3.connect(str(self.db_path))
        cursor = conn.cursor()

        # Cobertura mais recente
        cursor.execute("""
            SELECT * FROM coverage_snapshots
            ORDER BY timestamp DESC
            LIMIT 1
        """)
        latest = cursor.fetchone()

        # Cobertura anterior (para comparação)
        cursor.execute("""
            SELECT * FROM coverage_snapshots
            ORDER BY timestamp DESC
            LIMIT 1 OFFSET 1
        """)
        previous = cursor.fetchone()

        # Tendência
        trend = self.get_coverage_trend(30)

        conn.close()

        if not latest:
            return {"error": "Nenhum dado de cobertura disponível"}

        current = {
            "lines": {"covered": latest[3], "total": latest[4], "percentage": round(latest[3] * 100 / latest[4], 2) if latest[4] else 0},
            "branches": {"covered": latest[5], "total": latest[6], "percentage": round(latest[5] * 100 / latest[6], 2) if latest[6] else 0},
            "functions": {"covered": latest[7], "total": latest[8], "percentage": round(latest[7] * 100 / latest[8], 2) if latest[8] else 0}
        }

        # Comparação com anterior
        comparison = {}
        if previous:
            prev_lines_pct = previous[3] * 100 / previous[4] if previous[4] else 0
            curr_lines_pct = latest[3] * 100 / latest[4] if latest[4] else 0
            comparison["lines_change"] = round(curr_lines_pct - prev_lines_pct, 2)

            prev_branch_pct = previous[5] * 100 / previous[6] if previous[6] else 0
            curr_branch_pct = latest[5] * 100 / latest[6] if latest[6] else 0
            comparison["branches_change"] = round(curr_branch_pct - prev_branch_pct, 2)

        return {
            "timestamp": latest[1],
            "commit": latest[2],
            "current": current,
            "comparison": comparison,
            "trend": trend,
            "recommendations": self._generate_recommendations(current)
        }

    def _generate_recommendations(self, coverage: Dict) -> List[str]:
        """Gera recomendações baseadas na cobertura"""
        recommendations = []

        lines_pct = coverage["lines"]["percentage"]
        branches_pct = coverage["branches"]["percentage"]
        functions_pct = coverage["functions"]["percentage"]

        if lines_pct < 50:
            recommendations.append("🚨 Cobertura de linhas crítica (<50%). Aumentar testes urgentemente.")
        elif lines_pct < 70:
            recommendations.append("⚠️ Cobertura de linhas baixa (50-70%). Priorizar testes de caminhos críticos.")

        if branches_pct < lines_pct - 10:
            recommendations.append("📊 Branch coverage significativamente menor que line coverage. Adicionar testes para condições.")

        if functions_pct < 80:
            recommendations.append("🔧 Muitas funções não testadas. Verificar funções utilitárias.")

        if not recommendations:
            recommendations.append("✅ Cobertura adequada. Manter padrão.")

        return recommendations

    def detect_coverage_gaps(self, threshold: float = 70.0) -> List[Dict]:
        """Detecta arquivos com baixa cobertura"""
        conn = sqlite3.connect(str(self.db_path))
        cursor = conn.cursor()

        # Obtém snapshot mais recente
        cursor.execute("""
            SELECT id FROM coverage_snapshots
            ORDER BY timestamp DESC
            LIMIT 1
        """)
        latest = cursor.fetchone()

        if not latest:
            return []

        snapshot_id = latest[0]

        # Busca arquivos abaixo do threshold
        cursor.execute("""
            SELECT file_path, lines_covered, lines_total,
                   (lines_covered * 100.0 / lines_total) as percentage
            FROM file_coverage
            WHERE snapshot_id = ? AND lines_total > 0
            HAVING percentage < ?
            ORDER BY lines_total DESC
        """, (snapshot_id, threshold))

        results = cursor.fetchall()
        conn.close()

        return [
            {
                "file": row[0],
                "covered": row[1],
                "total": row[2],
                "percentage": round(row[3], 2)
            }
            for row in results
        ]


def main():
    parser = argparse.ArgumentParser(
        description="Coverage Reporter - GrowthOS",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python coverage-reporter.py --parse-lcov=coverage/lcov.info
  python coverage-reporter.py --parse-jest=coverage/coverage-final.json
  python coverage-reporter.py --report
  python coverage-reporter.py --trend
  python coverage-reporter.py --gaps
        """
    )

    parser.add_argument("--project", default=".", help="Caminho do projeto")
    parser.add_argument("--storage", default=".agent/test-engine/storage")
    parser.add_argument("--parse-lcov", help="Parse arquivo LCOV")
    parser.add_argument("--parse-cobertura", help="Parse arquivo Cobertura XML")
    parser.add_argument("--parse-jest", help="Parse arquivo JSON do Jest")
    parser.add_argument("--report", action="store_true", help="Gerar relatório")
    parser.add_argument("--trend", action="store_true", help="Mostrar tendência")
    parser.add_argument("--gaps", action="store_true", help="Detectar gaps")

    args = parser.parse_args()

    project_path = Path(args.project).resolve()
    storage_path = Path(args.storage).resolve()

    reporter = CoverageReporter(storage_path, project_path)

    print(f"📊 Coverage Reporter - GrowthOS")
    print(f"{'='*70}\n")

    if args.parse_lcov:
        coverage = reporter.parse_lcov(Path(args.parse_lcov))
        reporter.save_coverage(coverage)
        print(f"Cobertura salva: {coverage.lines_percentage:.1f}% linhas")

    elif args.parse_cobertura:
        coverage = reporter.parse_cobertura(Path(args.parse_cobertura))
        reporter.save_coverage(coverage)
        print(f"Cobertura salva: {coverage.lines_percentage:.1f}% linhas")

    elif args.parse_jest:
        coverage = reporter.parse_jest_json(Path(args.parse_jest))
        reporter.save_coverage(coverage)
        print(f"Cobertura salva: {coverage.lines_percentage:.1f}% linhas")

    elif args.report:
        report = reporter.generate_report()
        print(json.dumps(report, indent=2))

    elif args.trend:
        trend = reporter.get_coverage_trend()
        print("Tendência de Cobertura (30 dias):")
        for day in trend:
            print(f"  {day['date']}: {day['line_coverage']:.1f}% linhas, {day['branch_coverage']:.1f}% branches")

    elif args.gaps:
        gaps = reporter.detect_coverage_gaps(threshold=70)
        print(f"Arquivos com cobertura < 70%: {len(gaps)}")
        for gap in gaps[:20]:
            print(f"  - {gap['file']}: {gap['percentage']}% ({gap['covered']}/{gap['total']})")

    else:
        parser.print_help()


if __name__ == "__main__":
    main()
