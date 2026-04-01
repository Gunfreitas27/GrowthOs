#!/usr/bin/env python3
"""
Vitest Adapter - Adapter para execução de testes Vitest
Integração com o Test Orchestrator
"""

import subprocess
import json
from pathlib import Path
from typing import Dict, List, Optional


class VitestAdapter:
    """Adapter para executar testes com Vitest"""

    def __init__(self, project_path: Path):
        self.project_path = project_path

    def run(self, test_path: Optional[Path] = None, coverage: bool = False,
            verbose: bool = True) -> Dict:
        """Executa testes com Vitest"""

        cmd = ["npx", "vitest", "run"]

        if test_path:
            cmd.append(str(test_path))

        cmd.extend([
            "--reporter=json",
            "--outputFile=/tmp/vitest-results.json"
        ])

        if coverage:
            cmd.append("--coverage")

        if verbose:
            cmd.append("--reporter=verbose")

        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                cwd=str(self.project_path),
                timeout=300
            )

            return self._parse_results(result)

        except subprocess.TimeoutExpired:
            return {
                "status": "timeout",
                "error": "Timeout após 5 minutos",
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
        """Parse dos resultados do Vitest"""
        try:
            output_file = Path("/tmp/vitest-results.json")
            if output_file.exists():
                with open(output_file, 'r') as f:
                    vitest_data = json.load(f)

                # Calcula estatísticas
                test_files = vitest_data.get("testResults", [])
                total_tests = sum(len(f.get("assertionResults", [])) for f in test_files)
                passed = sum(1 for f in test_files for r in f.get("assertionResults", []) if r.get("status") == "passed")
                failed = sum(1 for f in test_files for r in f.get("assertionResults", []) if r.get("status") == "failed")

                return {
                    "status": "passed" if result.returncode == 0 else "failed",
                    "testResults": test_files,
                    "numTotalTests": total_tests,
                    "numPassedTests": passed,
                    "numFailedTests": failed,
                    "numPendingTests": total_tests - passed - failed,
                    "stdout": result.stdout,
                    "stderr": result.stderr
                }
        except Exception as e:
            pass

        return {
            "status": "passed" if result.returncode == 0 else "failed",
            "stdout": result.stdout,
            "stderr": result.stderr,
            "testResults": []
        }


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Vitest Adapter")
    parser.add_argument("project", help="Caminho do projeto")
    parser.add_argument("--test", help="Arquivo de teste específico")
    parser.add_argument("--coverage", action="store_true", help="Com cobertura")

    args = parser.parse_args()

    adapter = VitestAdapter(Path(args.project))
    test_path = Path(args.test) if args.test else None
    result = adapter.run(test_path, coverage=args.coverage)
    print(json.dumps(result, indent=2))
