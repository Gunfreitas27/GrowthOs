#!/usr/bin/env python3
"""
Jest Adapter - Adapter para execução de testes Jest
Integração com o Test Orchestrator
"""

import subprocess
import json
from pathlib import Path
from typing import Dict, List, Tuple, Optional


class JestAdapter:
    """Adapter para executar testes com Jest"""

    def __init__(self, project_path: Path):
        self.project_path = project_path
        self.coverage_dir = project_path / "coverage"

    def run(self, test_path: Optional[Path] = None, coverage: bool = False,
            verbose: bool = True, testNamePattern: str = None) -> Dict:
        """Executa testes com Jest"""

        cmd = ["npx", "jest"]

        if test_path:
            cmd.append(str(test_path))

        cmd.extend([
            "--json",
            "--outputFile=/tmp/jest-results.json",
            "--testLocationInResults"
        ])

        if coverage:
            cmd.append("--coverage")
            cmd.append("--coverageReporters=json")
            cmd.append("--coverageReporters=lcov")

        if verbose:
            cmd.append("--verbose")

        if testNamePattern:
            cmd.extend(["--testNamePattern", testNamePattern])

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
        """Parse dos resultados do Jest"""
        try:
            output_file = Path("/tmp/jest-results.json")
            if output_file.exists():
                with open(output_file, 'r') as f:
                    jest_data = json.load(f)

                return {
                    "status": "passed" if result.returncode == 0 else "failed",
                    "testResults": jest_data.get("testResults", []),
                    "numTotalTests": jest_data.get("numTotalTests", 0),
                    "numPassedTests": jest_data.get("numPassedTests", 0),
                    "numFailedTests": jest_data.get("numFailedTests", 0),
                    "numPendingTests": jest_data.get("numPendingTests", 0),
                    "stdout": result.stdout,
                    "stderr": result.stderr
                }
        except:
            pass

        return {
            "status": "passed" if result.returncode == 0 else "failed",
            "stdout": result.stdout,
            "stderr": result.stderr,
            "testResults": []
        }

    def get_config(self) -> Dict:
        """Obtém configuração do Jest"""
        try:
            result = subprocess.run(
                ["npx", "jest", "--showConfig"],
                capture_output=True,
                text=True,
                cwd=str(self.project_path)
            )

            # Extrai JSON da saída
            output = result.stdout
            json_start = output.find('{')
            json_end = output.rfind('}')

            if json_start >= 0 and json_end > json_start:
                return json.loads(output[json_start:json_end+1])
        except:
            pass

        return {}

    def list_tests(self, pattern: str = None) -> List[Dict]:
        """Lista todos os testes disponíveis"""
        cmd = ["npx", "jest", "--listTests", "--json"]

        if pattern:
            cmd.extend(["--testPathPattern", pattern])

        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                cwd=str(self.project_path)
            )

            if result.returncode == 0:
                return [{"path": path} for path in json.loads(result.stdout)]
        except:
            pass

        return []


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Jest Adapter")
    parser.add_argument("project", help="Caminho do projeto")
    parser.add_argument("--test", help="Arquivo de teste específico")
    parser.add_argument("--coverage", action="store_true", help="Com cobertura")
    parser.add_argument("--list", action="store_true", help="Listar testes")

    args = parser.parse_args()

    adapter = JestAdapter(Path(args.project))

    if args.list:
        tests = adapter.list_tests()
        print(json.dumps(tests, indent=2))
    else:
        test_path = Path(args.test) if args.test else None
        result = adapter.run(test_path, coverage=args.coverage)
        print(json.dumps(result, indent=2))
