#!/usr/bin/env python3
"""
Pytest Adapter - Adapter para execução de testes Python
Integração com o Test Orchestrator
"""

import subprocess
import json
from pathlib import Path
from typing import Dict, List, Optional


class PytestAdapter:
    """Adapter para executar testes com Pytest"""

    def __init__(self, project_path: Path):
        self.project_path = project_path

    def run(self, test_path: Optional[Path] = None, coverage: bool = False,
            verbose: bool = True, markers: List[str] = None) -> Dict:
        """Executa testes com Pytest"""

        cmd = ["python", "-m", "pytest"]

        if test_path:
            cmd.append(str(test_path))

        cmd.extend(["-v", "--tb=short"])

        if coverage:
            cmd.extend(["--cov", "--cov-report=json", "--cov-report=term-missing"])

        if markers:
            for marker in markers:
                cmd.extend(["-m", marker])

        # Output em formato JSON
        cmd.extend(["--json-report", "--json-report-file=/tmp/pytest-results.json"])

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
        """Parse dos resultados do Pytest"""
        try:
            output_file = Path("/tmp/pytest-results.json")
            if output_file.exists():
                with open(output_file, 'r') as f:
                    pytest_data = json.load(f)

                return {
                    "status": "passed" if result.returncode == 0 else "failed",
                    "summary": pytest_data.get("summary", {}),
                    "tests": pytest_data.get("tests", []),
                    "duration": pytest_data.get("duration", 0),
                    "stdout": result.stdout,
                    "stderr": result.stderr
                }
        except:
            pass

        # Fallback: parse do output
        stdout = result.stdout or ""
        passed = stdout.count(" PASSED")
        failed = stdout.count(" FAILED")
        error = stdout.count(" ERROR")

        return {
            "status": "passed" if result.returncode == 0 else "failed",
            "numPassedTests": passed,
            "numFailedTests": failed,
            "numErrorTests": error,
            "stdout": stdout,
            "stderr": result.stderr
        }

    def list_tests(self, pattern: str = None) -> List[Dict]:
        """Lista todos os testes disponíveis"""
        cmd = ["python", "-m", "pytest", "--collect-only", "-q"]

        if pattern:
            cmd.append(pattern)

        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                cwd=str(self.project_path)
            )

            tests = []
            for line in result.stdout.split('\n'):
                if '::' in line:
                    tests.append({"name": line.strip()})

            return tests
        except:
            return []

    def get_coverage(self) -> Dict:
        """Obtém dados de cobertura"""
        try:
            coverage_file = self.project_path / "coverage.json"
            if coverage_file.exists():
                with open(coverage_file, 'r') as f:
                    return json.load(f)
        except:
            pass
        return {}


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Pytest Adapter")
    parser.add_argument("project", help="Caminho do projeto")
    parser.add_argument("--test", help="Arquivo de teste específico")
    parser.add_argument("--coverage", action="store_true", help="Com cobertura")
    parser.add_argument("--list", action="store_true", help="Listar testes")
    parser.add_argument("-m", action="append", help="Marcadores", default=[])

    args = parser.parse_args()

    adapter = PytestAdapter(Path(args.project))

    if args.list:
        tests = adapter.list_tests()
        print(json.dumps(tests, indent=2))
    else:
        test_path = Path(args.test) if args.test else None
        result = adapter.run(test_path, coverage=args.coverage, markers=args.m)
        print(json.dumps(result, indent=2))
