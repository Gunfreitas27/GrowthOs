#!/usr/bin/env python3
"""
Playwright Adapter - Adapter para execução de testes E2E
Integração com o Test Orchestrator
"""

import subprocess
import json
from pathlib import Path
from typing import Dict, List, Optional


class PlaywrightAdapter:
    """Adapter para executar testes com Playwright"""

    def __init__(self, project_path: Path):
        self.project_path = project_path
        self.config_file = project_path / "playwright.config.ts"
        if not self.config_file.exists():
            self.config_file = project_path / "playwright.config.js"

    def run(self, test_path: Optional[Path] = None, headed: bool = False,
            project: str = None, workers: int = 1) -> Dict:
        """Executa testes com Playwright"""

        cmd = ["npx", "playwright", "test"]

        if test_path:
            cmd.append(str(test_path))

        if headed:
            cmd.append("--headed")

        if project:
            cmd.extend(["--project", project])

        cmd.extend(["--workers", str(workers)])
        cmd.append("--reporter=list")

        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                cwd=str(self.project_path),
                timeout=600  # 10 minutos para E2E
            )

            return self._parse_results(result)

        except subprocess.TimeoutExpired:
            return {
                "status": "timeout",
                "error": "Timeout após 10 minutos",
                "stdout": "",
                "stderr": ""
            }
        except Exception as e:
            return {
                "status": "error",
                "error": str(e),
                "stdout": "",
                "stderr": ""
            }

    def _parse_results(self, result: subprocess.CompletedProcess) -> Dict:
        """Parse dos resultados do Playwright"""
        stdout = result.stdout or ""

        # Extrai informações do output
        total = 0
        passed = 0
        failed = 0
        skipped = 0

        for line in stdout.split('\n'):
            if 'passed' in line.lower():
                try:
                    import re
                    match = re.search(r'(\d+)\s+passed', line)
                    if match:
                        passed = int(match.group(1))
                except:
                    pass
            elif 'failed' in line.lower():
                try:
                    import re
                    match = re.search(r'(\d+)\s+failed', line)
                    if match:
                        failed = int(match.group(1))
                except:
                    pass

        total = passed + failed + skipped

        return {
            "status": "passed" if result.returncode == 0 else "failed",
            "numTotalTests": total,
            "numPassedTests": passed,
            "numFailedTests": failed,
            "numSkippedTests": skipped,
            "stdout": stdout,
            "stderr": result.stderr
        }

    def list_tests(self) -> List[Dict]:
        """Lista todos os testes disponíveis"""
        try:
            result = subprocess.run(
                ["npx", "playwright", "test", "--list"],
                capture_output=True,
                text=True,
                cwd=str(self.project_path)
            )

            # Parse da lista
            tests = []
            for line in result.stdout.split('\n'):
                if line.strip() and not line.startswith('Listing'):
                    tests.append({"name": line.strip()})

            return tests
        except:
            return []

    def show_report(self):
        """Mostra relatório HTML"""
        subprocess.run(
            ["npx", "playwright", "show-report"],
            cwd=str(self.project_path)
        )


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Playwright Adapter")
    parser.add_argument("project", help="Caminho do projeto")
    parser.add_argument("--test", help="Arquivo de teste específico")
    parser.add_argument("--headed", action="store_true", help="Executar com navegador visível")
    parser.add_argument("--list", action="store_true", help="Listar testes")
    parser.add_argument("--workers", type=int, default=1, help="Número de workers")

    args = parser.parse_args()

    adapter = PlaywrightAdapter(Path(args.project))

    if args.list:
        tests = adapter.list_tests()
        print(json.dumps(tests, indent=2))
    else:
        test_path = Path(args.test) if args.test else None
        result = adapter.run(test_path, headed=args.headed, workers=args.workers)
        print(json.dumps(result, indent=2))
