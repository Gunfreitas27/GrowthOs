#!/usr/bin/env python3
"""
Test Orchestrator - Core do Sistema de Testes GrowthOS
Inspirado no Ekyte - Orquestração inteligente de testes

Funcionalidades:
- Seleção inteligente de testes (changed, failed, impacted, flaky)
- Paralelização dinâmica com sharding otimizado
- Retry automático de testes flaky
- Cache de execução e otimização de pipelines
"""

import sys
import subprocess
import json
import os
import re
import hashlib
import sqlite3
from pathlib import Path
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Tuple, Any
from dataclasses import dataclass, asdict
from concurrent.futures import ThreadPoolExecutor, as_completed
import argparse
import tempfile
import time

# Fix Windows console encoding
try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')
except:
    pass


@dataclass
class TestConfig:
    """Configuração de execução de testes"""
    mode: str = "full"  # full, changed, failed, impacted, flaky
    workers: int = 4
    since_commit: Optional[str] = None
    parallel: bool = True
    retries: int = 2
    timeout: int = 300
    coverage: bool = False
    project_path: Path = Path(".")
    frameworks: List[str] = None
    tags: List[str] = None
    suite: Optional[str] = None

    def __post_init__(self):
        if self.frameworks is None:
            self.frameworks = ["auto"]
        if self.tags is None:
            self.tags = []


@dataclass
class TestCase:
    """Representação de um caso de teste"""
    id: str
    name: str
    path: Path
    type: str  # unit, integration, e2e, visual, perf
    priority: str  # P0, P1, P2, P3
    suite: str
    tags: List[str]
    estimated_duration: float = 1.0
    last_status: str = "unknown"
    last_duration: float = 0.0
    flakiness_score: float = 0.0
    dependencies: List[str] = None

    def __post_init__(self):
        if self.dependencies is None:
            self.dependencies = []


@dataclass
class TestResult:
    """Resultado de execução de um teste"""
    test_id: str
    status: str  # passed, failed, skipped, error, flaky
    duration: float
    stdout: str = ""
    stderr: str = ""
    error_message: str = ""
    stack_trace: str = ""
    retry_count: int = 0
    shard_id: int = 0
    worker_id: int = 0
    timestamp: datetime = None

    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now()


class TestSelector:
    """Seletor inteligente de testes"""

    def __init__(self, storage_path: Path):
        self.storage_path = storage_path
        self.db_path = storage_path / "test_history.db"
        self._init_db()

    def _init_db(self):
        """Inicializa banco de dados SQLite"""
        os.makedirs(self.storage_path, exist_ok=True)
        conn = sqlite3.connect(str(self.db_path))
        cursor = conn.cursor()

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS test_runs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                test_id TEXT NOT NULL,
                status TEXT NOT NULL,
                duration REAL,
                timestamp TEXT,
                commit_hash TEXT,
                branch TEXT,
                flakiness_score REAL DEFAULT 0
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS test_metadata (
                test_id TEXT PRIMARY KEY,
                path TEXT,
                type TEXT,
                priority TEXT,
                suite TEXT,
                tags TEXT,
                estimated_duration REAL DEFAULT 1.0
            )
        """)

        conn.commit()
        conn.close()

    def select_tests(self, config: TestConfig) -> List[TestCase]:
        """Seleciona testes baseado no modo"""

        if config.mode == "full":
            return self._select_all_tests(config)
        elif config.mode == "changed":
            return self._select_changed_tests(config)
        elif config.mode == "failed":
            return self._select_failed_tests(config)
        elif config.mode == "impacted":
            return self._select_impacted_tests(config)
        elif config.mode == "flaky":
            return self._select_flaky_tests(config)
        else:
            return self._select_all_tests(config)

    def _select_all_tests(self, config: TestConfig) -> List[TestCase]:
        """Seleciona todos os testes do projeto"""
        tests = []

        # Busca testes em diferentes padrões
        patterns = [
            "**/*.test.{ts,tsx,js,jsx}",
            "**/*.spec.{ts,tsx,js,jsx}",
            "**/__tests__/**/*.{ts,tsx,js,jsx}",
            "**/tests/**/*.{ts,tsx,js,jsx}",
            "**/e2e/**/*.{ts,tsx,js,jsx}",
            "**/test_*.py",
            "**/*_test.py"
        ]

        for pattern in patterns:
            for test_file in config.project_path.rglob(pattern):
                if "node_modules" in str(test_file):
                    continue

                test = self._parse_test_file(test_file, config.project_path)
                if test:
                    tests.append(test)

        # Filtra por tags e suite se especificado
        if config.tags:
            tests = [t for t in tests if any(tag in t.tags for tag in config.tags)]

        if config.suite:
            tests = [t for t in tests if t.suite == config.suite]

        return tests

    def _select_changed_tests(self, config: TestConfig) -> List[TestCase]:
        """Seleciona testes dos arquivos modificados"""
        changed_files = self._get_changed_files(config)

        # Mapeia arquivos modificados para seus testes
        all_tests = self._select_all_tests(config)
        selected_tests = []

        for test in all_tests:
            # Verifica se o teste foi modificado
            if str(test.path) in changed_files:
                selected_tests.append(test)
                continue

            # Verifica se código relacionado foi modificado
            source_file = self._find_source_file(test)
            if source_file and str(source_file) in changed_files:
                selected_tests.append(test)

        return selected_tests

    def _select_failed_tests(self, config: TestConfig) -> List[TestCase]:
        """Seleciona testes que falharam recentemente"""
        conn = sqlite3.connect(str(self.db_path))
        cursor = conn.cursor()

        # Busca testes que falharam nas últimas 5 execuções
        cursor.execute("""
            SELECT DISTINCT test_id FROM test_runs
            WHERE status IN ('failed', 'error')
            AND timestamp > datetime('now', '-7 days')
        """)

        failed_ids = [row[0] for row in cursor.fetchall()]
        conn.close()

        all_tests = self._select_all_tests(config)
        return [t for t in all_tests if t.id in failed_ids]

    def _select_impacted_tests(self, config: TestConfig) -> List[TestCase]:
        """Seleciona testes impactados por mudanças (análise de dependências)"""
        changed_files = self._get_changed_files(config)

        # TODO: Implementar análise de dependências via import graph
        # Por enquanto, usa a mesma lógica de changed
        return self._select_changed_tests(config)

    def _select_flaky_tests(self, config: TestConfig) -> List[TestCase]:
        """Seleciona testes marcados como flaky"""
        conn = sqlite3.connect(str(self.db_path))
        cursor = conn.cursor()

        cursor.execute("""
            SELECT test_id FROM test_metadata
            WHERE flakiness_score > 40
        """)

        flaky_ids = [row[0] for row in cursor.fetchall()]
        conn.close()

        all_tests = self._select_all_tests(config)
        return [t for t in all_tests if t.id in flaky_ids]

    def _get_changed_files(self, config: TestConfig) -> List[str]:
        """Obtém lista de arquivos modificados desde o commit"""
        try:
            since = config.since_commit or "HEAD~1"
            result = subprocess.run(
                ["git", "diff", "--name-only", since],
                capture_output=True,
                text=True,
                cwd=str(config.project_path)
            )
            return result.stdout.strip().split("\n")
        except:
            return []

    def _parse_test_file(self, test_file: Path, project_path: Path) -> Optional[TestCase]:
        """Extrai metadados de um arquivo de teste"""
        try:
            content = test_file.read_text(encoding='utf-8', errors='ignore')

            # Detecta tipo de teste
            test_type = self._detect_test_type(test_file, content)

            # Extrai nome do teste
            test_name = test_file.stem.replace(".test", "").replace(".spec", "")

            # Gera ID único
            rel_path = test_file.relative_to(project_path)
            test_id = f"{rel_path.parent}/{test_file.stem}".replace("/", "-").replace("\\", "-")

            # Detecta prioridade baseada no caminho
            priority = self._detect_priority(test_file)

            # Detecta suite
            suite = self._detect_suite(test_file, project_path)

            # Extrai tags
            tags = self._extract_tags(content)

            # Estima duração baseada em histórico ou padrão
            estimated_duration = self._get_estimated_duration(test_id)

            return TestCase(
                id=test_id,
                name=test_name,
                path=test_file,
                type=test_type,
                priority=priority,
                suite=suite,
                tags=tags,
                estimated_duration=estimated_duration
            )
        except Exception as e:
            return None

    def _detect_test_type(self, test_file: Path, content: str) -> str:
        """Detecta o tipo de teste"""
        path_str = str(test_file).lower()

        if any(x in path_str for x in ["e2e", "playwright", "cypress", ".spec"]):
            return "e2e"
        elif any(x in path_str for x in ["integration", "api", "contract"]):
            return "integration"
        elif any(x in path_str for x in ["visual", "snapshot", "screenshot"]):
            return "visual"
        elif any(x in path_str for x in ["perf", "benchmark", "load"]):
            return "perf"
        elif "describe" in content or "it(" in content or "test(" in content:
            return "unit"
        else:
            return "unit"

    def _detect_priority(self, test_file: Path) -> str:
        """Detecta prioridade baseada no caminho/nome"""
        path_str = str(test_file).lower()

        if any(x in path_str for x in ["critical", "p0", "smoke", "auth", "login", "payment"]):
            return "P0"
        elif any(x in path_str for x in ["important", "p1", "core"]):
            return "P1"
        elif any(x in path_str for x in ["p2", "secondary"]):
            return "P2"
        else:
            return "P3"

    def _detect_suite(self, test_file: Path, project_path: Path) -> str:
        """Detecta a qual suite o teste pertence"""
        rel_path = test_file.relative_to(project_path)
        parts = rel_path.parts

        if len(parts) >= 2:
            if parts[0] in ["tests", "test", "__tests__", "e2e"]:
                return parts[1] if len(parts) > 1 else "default"
            return parts[0]
        return "default"

    def _extract_tags(self, content: str) -> List[str]:
        """Extrai tags do conteúdo do arquivo"""
        tags = []

        # Procura por @tags ou comentários de tags
        tag_patterns = [
            r"@(\w+)",
            r"#\s*tag:\s*(\w+)",
            r"/\*\s*tag:\s*(\w+)\s*\*/"
        ]

        for pattern in tag_patterns:
            matches = re.findall(pattern, content)
            tags.extend(matches)

        return list(set(tags))

    def _get_estimated_duration(self, test_id: str) -> float:
        """Obtém duração estimada do histórico"""
        try:
            conn = sqlite3.connect(str(self.db_path))
            cursor = conn.cursor()

            cursor.execute("""
                SELECT AVG(duration) FROM test_runs
                WHERE test_id = ? AND duration IS NOT NULL
                AND timestamp > datetime('now', '-30 days')
            """, (test_id,))

            result = cursor.fetchone()
            conn.close()

            if result and result[0]:
                return float(result[0])
        except:
            pass

        return 1.0  # Default: 1 segundo

    def _find_source_file(self, test: TestCase) -> Optional[Path]:
        """Tenta encontrar o arquivo fonte correspondente ao teste"""
        test_path = test.path

        # Tenta várias convenções de nomenclatura
        candidates = [
            test_path.parent / test_path.stem.replace(".test", "").replace(".spec", ""),
            test_path.parent / f"{test_path.stem.replace('.test', '').replace('.spec', '')}.ts",
            test_path.parent / f"{test_path.stem.replace('.test', '').replace('.spec', '')}.js",
            test_path.parent / ".." / f"{test_path.stem.replace('.test', '').replace('.spec', '')}.ts",
        ]

        for candidate in candidates:
            if candidate.exists():
                return candidate

        return None


class ShardManager:
    """Gerenciador de shards para execução paralela otimizada"""

    def __init__(self):
        self.strategy = "duration-balanced"

    def create_shards(self, tests: List[TestCase], worker_count: int) -> List[List[TestCase]]:
        """Distribui testes em shards otimizados"""

        if not tests:
            return []

        # Ordena por prioridade (P0 primeiro) e depois por duração estimada
        sorted_tests = sorted(
            tests,
            key=lambda t: ({
                "P0": 0, "P1": 1, "P2": 2, "P3": 3
            }.get(t.priority, 4), -t.estimated_duration)
        )

        # Estratégia: Balanceamento por duração estimada
        shards = [[] for _ in range(worker_count)]
        shard_durations = [0.0] * worker_count

        for test in sorted_tests:
            # Coloca no shard com menor duração total
            min_shard_idx = shard_durations.index(min(shard_durations))
            shards[min_shard_idx].append(test)
            shard_durations[min_shard_idx] += test.estimated_duration

        # Remove shards vazios
        shards = [s for s in shards if s]

        return shards

    def get_optimal_workers(self, test_count: int) -> int:
        """Calcula número ótimo de workers baseado na quantidade de testes"""
        import os
        cpu_count = os.cpu_count() or 4

        # Heurística: não mais que CPUs, não mais que metade dos testes
        return min(cpu_count, max(1, test_count // 2))


class TestOrchestrator:
    """Orquestrador principal de testes - Inspirado no Ekyte"""

    def __init__(self, project_path: Path = None):
        self.project_path = project_path or Path(".")
        self.storage_path = self.project_path / ".agent" / "test-engine" / "storage"
        self.selector = TestSelector(self.storage_path)
        self.shard_manager = ShardManager()
        self.results: List[TestResult] = []

        os.makedirs(self.storage_path, exist_ok=True)

    def run(self, config: TestConfig) -> Dict[str, Any]:
        """Executa o ciclo completo de testes"""
        print(f"\n{'='*70}")
        print(f"🧪 TEST ORCHESTRATOR - GrowthOS")
        print(f"{'='*70}")
        print(f"Mode: {config.mode}")
        print(f"Workers: {config.workers}")
        print(f"Project: {config.project_path}")
        print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"{'='*70}\n")

        start_time = time.time()

        # 1. Seleção de testes
        print("📋 Selecionando testes...")
        tests = self.selector.select_tests(config)
        print(f"   Encontrados: {len(tests)} testes")

        if not tests:
            return {
                "status": "success",
                "message": "Nenhum teste selecionado",
                "summary": {"total": 0, "passed": 0, "failed": 0}
            }

        # 2. Criação de shards
        if config.parallel:
            shards = self.shard_manager.create_shards(tests, config.workers)
        else:
            shards = [tests]

        print(f"   Shards criados: {len(shards)}")

        # 3. Execução paralela
        print("\n🚀 Executando testes...")
        all_results = []

        if config.parallel and len(shards) > 1:
            with ThreadPoolExecutor(max_workers=len(shards)) as executor:
                futures = {
                    executor.submit(self._run_shard, shard, i, config): i
                    for i, shard in enumerate(shards)
                }

                for future in as_completed(futures):
                    shard_results = future.result()
                    all_results.extend(shard_results)
        else:
            for i, shard in enumerate(shards):
                shard_results = self._run_shard(shard, i, config)
                all_results.extend(shard_results)

        # 4. Análise de resultados
        print("\n📊 Analisando resultados...")
        summary = self._analyze_results(all_results)

        # 5. Persistência
        self._save_results(all_results, config)

        elapsed = time.time() - start_time

        print(f"\n{'='*70}")
        print(f"✅ Execução completada em {elapsed:.1f}s")
        print(f"{'='*70}")

        return {
            "status": "success" if summary["failed"] == 0 else "failed",
            "duration": elapsed,
            "summary": summary,
            "results": [asdict(r) for r in all_results],
            "shards": len(shards),
            "config": {
                "mode": config.mode,
                "workers": config.workers
            }
        }

    def _run_shard(self, tests: List[TestCase], shard_id: int, config: TestConfig) -> List[TestResult]:
        """Executa um shard de testes"""
        results = []

        for test in tests:
            result = self._run_test(test, shard_id, config)
            results.append(result)

            # Retry para testes flaky
            if result.status == "failed" and test.flakiness_score > 30:
                for retry in range(config.retries):
                    time.sleep(0.5)  # Pequena pausa entre retries
                    retry_result = self._run_test(test, shard_id, config)
                    if retry_result.status == "passed":
                        retry_result.status = "flaky"
                        retry_result.retry_count = retry + 1
                        results[-1] = retry_result
                        break

        return results

    def _run_test(self, test: TestCase, shard_id: int, config: TestConfig) -> TestResult:
        """Executa um teste individual"""
        start_time = time.time()

        try:
            # Detecta framework e executa
            framework = self._detect_framework(test.path)

            if framework == "jest":
                status, stdout, stderr = self._run_jest(test, config)
            elif framework == "vitest":
                status, stdout, stderr = self._run_vitest(test, config)
            elif framework == "pytest":
                status, stdout, stderr = self._run_pytest(test, config)
            else:
                # Fallback: tenta npm test
                status, stdout, stderr = self._run_npm(test, config)

            duration = time.time() - start_time

            return TestResult(
                test_id=test.id,
                status=status,
                duration=duration,
                stdout=stdout[:5000],
                stderr=stderr[:2000],
                shard_id=shard_id
            )

        except Exception as e:
            duration = time.time() - start_time
            return TestResult(
                test_id=test.id,
                status="error",
                duration=duration,
                error_message=str(e),
                shard_id=shard_id
            )

    def _detect_framework(self, test_path: Path) -> str:
        """Detecta qual framework de teste usar"""
        content = test_path.read_text(encoding='utf-8', errors='ignore').lower()

        if "vitest" in content or "@vitest" in content:
            return "vitest"
        elif "jest" in content or "@jest" in content:
            return "jest"
        elif "pytest" in content or ".py" in str(test_path):
            return "pytest"
        elif "playwright" in content:
            return "playwright"

        # Verifica package.json
        package_json = self.project_path / "package.json"
        if package_json.exists():
            pkg_content = package_json.read_text(encoding='utf-8', errors='ignore').lower()
            if "vitest" in pkg_content:
                return "vitest"
            elif "jest" in pkg_content:
                return "jest"

        return "unknown"

    def _run_jest(self, test: TestCase, config: TestConfig) -> Tuple[str, str, str]:
        """Executa teste com Jest"""
        cmd = [
            "npx", "jest",
            str(test.path),
            "--json",
            "--verbose"
        ]

        if config.coverage:
            cmd.append("--coverage")

        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            cwd=str(self.project_path),
            timeout=config.timeout
        )

        status = "passed" if result.returncode == 0 else "failed"
        return status, result.stdout, result.stderr

    def _run_vitest(self, test: TestCase, config: TestConfig) -> Tuple[str, str, str]:
        """Executa teste com Vitest"""
        cmd = [
            "npx", "vitest", "run",
            str(test.path),
            "--reporter=json"
        ]

        if config.coverage:
            cmd.append("--coverage")

        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            cwd=str(self.project_path),
            timeout=config.timeout
        )

        status = "passed" if result.returncode == 0 else "failed"
        return status, result.stdout, result.stderr

    def _run_pytest(self, test: TestCase, config: TestConfig) -> Tuple[str, str, str]:
        """Executa teste com Pytest"""
        cmd = [
            sys.executable, "-m", "pytest",
            str(test.path),
            "-v",
            "--tb=short"
        ]

        if config.coverage:
            cmd.extend(["--cov", "--cov-report=term-missing"])

        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            cwd=str(self.project_path),
            timeout=config.timeout
        )

        status = "passed" if result.returncode == 0 else "failed"
        return status, result.stdout, result.stderr

    def _run_npm(self, test: TestCase, config: TestConfig) -> Tuple[str, str, str]:
        """Fallback: executa com npm test"""
        result = subprocess.run(
            ["npm", "test"],
            capture_output=True,
            text=True,
            cwd=str(self.project_path),
            timeout=config.timeout
        )

        status = "passed" if result.returncode == 0 else "failed"
        return status, result.stdout, result.stderr

    def _analyze_results(self, results: List[TestResult]) -> Dict[str, Any]:
        """Analisa resultados da execução"""
        total = len(results)
        passed = sum(1 for r in results if r.status == "passed")
        failed = sum(1 for r in results if r.status == "failed")
        skipped = sum(1 for r in results if r.status == "skipped")
        errors = sum(1 for r in results if r.status == "error")
        flaky = sum(1 for r in results if r.status == "flaky")

        total_duration = sum(r.duration for r in results)
        avg_duration = total_duration / total if total > 0 else 0

        print(f"   Total: {total}")
        print(f"   ✅ Passed: {passed}")
        print(f"   ❌ Failed: {failed}")
        print(f"   ⚠️  Flaky: {flaky}")
        print(f"   ⏭️  Skipped: {skipped}")
        print(f"   💥 Errors: {errors}")
        print(f"   ⏱️  Duration: {total_duration:.1f}s (avg: {avg_duration:.2f}s)")

        if failed > 0:
            print("\n❌ Failed Tests:")
            for r in results:
                if r.status == "failed":
                    print(f"   - {r.test_id}")

        return {
            "total": total,
            "passed": passed,
            "failed": failed,
            "skipped": skipped,
            "errors": errors,
            "flaky": flaky,
            "duration": total_duration,
            "avg_duration": avg_duration
        }

    def _save_results(self, results: List[TestResult], config: TestConfig):
        """Persiste resultados no banco de dados"""
        conn = sqlite3.connect(str(self.storage_path / "test_history.db"))
        cursor = conn.cursor()

        for result in results:
            cursor.execute("""
                INSERT INTO test_runs
                (test_id, status, duration, timestamp, branch)
                VALUES (?, ?, ?, ?, ?)
            """, (
                result.test_id,
                result.status,
                result.duration,
                result.timestamp.isoformat(),
                self._get_current_branch()
            ))

        conn.commit()
        conn.close()

    def _get_current_branch(self) -> str:
        """Obtém branch atual do git"""
        try:
            result = subprocess.run(
                ["git", "rev-parse", "--abbrev-ref", "HEAD"],
                capture_output=True,
                text=True,
                cwd=str(self.project_path)
            )
            return result.stdout.strip()
        except:
            return "unknown"


def main():
    parser = argparse.ArgumentParser(
        description="Test Orchestrator - GrowthOS",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python test-orchestrator.py --mode=full
  python test-orchestrator.py --mode=changed --since=HEAD~5
  python test-orchestrator.py --mode=failed --workers=8
  python test-orchestrator.py --mode=flaky --retries=3
        """
    )

    parser.add_argument("project", nargs="?", default=".", help="Caminho do projeto")
    parser.add_argument("--mode", default="full",
                       choices=["full", "changed", "failed", "impacted", "flaky"],
                       help="Modo de seleção de testes")
    parser.add_argument("--workers", type=int, default=4, help="Número de workers paralelos")
    parser.add_argument("--since", help="Commit de referência (para mode=changed)")
    parser.add_argument("--retries", type=int, default=2, help="Número de retries")
    parser.add_argument("--coverage", action="store_true", help="Gerar cobertura")
    parser.add_argument("--no-parallel", action="store_true", help="Desativar paralelismo")
    parser.add_argument("--suite", help="Executar apenas uma suite")
    parser.add_argument("--tags", help="Tags para filtrar (separadas por vírgula)")

    args = parser.parse_args()

    config = TestConfig(
        mode=args.mode,
        workers=args.workers,
        since_commit=args.since,
        retries=args.retries,
        coverage=args.coverage,
        parallel=not args.no_parallel,
        project_path=Path(args.project).resolve(),
        suite=args.suite,
        tags=args.tags.split(",") if args.tags else []
    )

    orchestrator = TestOrchestrator(config.project_path)
    result = orchestrator.run(config)

    # Output JSON
    print("\n" + "="*70)
    print("JSON OUTPUT:")
    print("="*70)
    print(json.dumps(result, indent=2, default=str))

    sys.exit(0 if result["status"] == "success" else 1)


if __name__ == "__main__":
    main()
