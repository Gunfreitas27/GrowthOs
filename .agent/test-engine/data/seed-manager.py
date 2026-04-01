#!/usr/bin/env python3
"""
Seed Manager - Gerenciamento de Seeds de Banco de Dados
Inspirado no Ekyte - Seeds versionados e reproduzíveis

Funcionalidades:
- Seeds versionados
- Cenários predefinidos
- Aplicação idempotente
- Rollback de seeds
"""

import sys
import json
import sqlite3
import hashlib
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any, Optional, Callable
from dataclasses import dataclass
import argparse

# Fix Windows console encoding
try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')
except:
    pass


@dataclass
class SeedDefinition:
    """Definição de um seed"""
    name: str
    version: str
    description: str
    tables: Dict[str, List[Dict]]
    dependencies: List[str]


class SeedManager:
    """Gerenciador de seeds do GrowthOS"""

    def __init__(self, project_path: Path = None):
        self.project_path = project_path or Path(".")
        self.seeds_path = self.project_path / ".agent" / "test-engine" / "seeds"
        self.seeds_path.mkdir(parents=True, exist_ok=True)

        self._registry: Dict[str, SeedDefinition] = {}
        self._load_registry()

    def _load_registry(self):
        """Carrega registro de seeds"""
        registry_file = self.seeds_path / ".registry.json"
        if registry_file.exists():
            with open(registry_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                for name, seed_data in data.items():
                    self._registry[name] = SeedDefinition(**seed_data)

    def _save_registry(self):
        """Salva registro de seeds"""
        registry_file = self.seeds_path / ".registry.json"
        with open(registry_file, 'w', encoding='utf-8') as f:
            json.dump(
                {name: {
                    "name": s.name,
                    "version": s.version,
                    "description": s.description,
                    "tables": s.tables,
                    "dependencies": s.dependencies
                } for name, s in self._registry.items()},
                f,
                indent=2
            )

    def define_seed(self, name: str, tables: Dict[str, List[Dict]],
                   version: str = "1.0.0",
                   description: str = "",
                   dependencies: List[str] = None):
        """Define um novo seed"""
        seed = SeedDefinition(
            name=name,
            version=version,
            description=description,
            tables=tables,
            dependencies=dependencies or []
        )
        self._registry[name] = seed
        self._save_registry()

    def create_scenario(self, scenario: str) -> SeedDefinition:
        """Cria um seed baseado em cenário predefinido"""
        scenarios = {
            "minimal": self._create_minimal_scenario,
            "standard": self._create_standard_scenario,
            "stress": self._create_stress_scenario,
            "edge_cases": self._create_edge_cases_scenario,
            "demo": self._create_demo_scenario
        }

        if scenario not in scenarios:
            raise ValueError(f"Cenário '{scenario}' não existe. Opções: {list(scenarios.keys())}")

        return scenarios[scenario]()

    def _create_minimal_scenario(self) -> SeedDefinition:
        """Cria seed com dados mínimos"""
        return SeedDefinition(
            name="minimal",
            version="1.0.0",
            description="Dados mínimos para testes rápidos",
            tables={
                "users": [
                    {"id": 1, "email": "admin@test.com", "role": "admin", "active": True},
                    {"id": 2, "email": "user@test.com", "role": "user", "active": True}
                ],
                "products": [
                    {"id": 1, "name": "Test Product", "price": 99.99, "stock": 100}
                ]
            },
            dependencies=[]
        )

    def _create_standard_scenario(self) -> SeedDefinition:
        """Cria seed com dados padrão"""
        users = [
            {"id": i, "email": f"user{i}@test.com", "role": "user" if i > 1 else "admin", "active": True}
            for i in range(1, 11)
        ]

        products = [
            {"id": i, "name": f"Product {i}", "price": 10.0 * i, "stock": 100}
            for i in range(1, 21)
        ]

        orders = [
            {"id": i, "user_id": (i % 10) + 1, "total": 50.0 * i, "status": "pending"}
            for i in range(1, 31)
        ]

        return SeedDefinition(
            name="standard",
            version="1.0.0",
            description="Dataset padrão para testes",
            tables={
                "users": users,
                "products": products,
                "orders": orders
            },
            dependencies=[]
        )

    def _create_stress_scenario(self) -> SeedDefinition:
        """Cria seed com volume alto para stress testing"""
        return SeedDefinition(
            name="stress",
            version="1.0.0",
            description="Alto volume de dados para stress testing",
            tables={
                "users": [
                    {"id": i, "email": f"user{i}@test.com", "role": "user", "active": True}
                    for i in range(1, 10001)
                ],
                "products": [
                    {"id": i, "name": f"Product {i}", "price": random.uniform(10, 1000), "stock": random.randint(0, 1000)}
                    for i in range(1, 5001)
                ]
            },
            dependencies=[]
        )

    def _create_edge_cases_scenario(self) -> SeedDefinition:
        """Cria seed com casos extremos"""
        return SeedDefinition(
            name="edge_cases",
            version="1.0.0",
            description="Casos extremos e boundary conditions",
            tables={
                "users": [
                    {"id": 1, "email": "", "role": "user", "active": False},  # Email vazio
                    {"id": 2, "email": "a" * 256 + "@test.com", "role": "user", "active": True},  # Email muito longo
                    {"id": 3, "email": "special!#$%@test.com", "role": "user", "active": True},  # Caracteres especiais
                    {"id": 4, "email": "unicode@test.com", "role": "user", "active": True, "name": "日本語"}
                ],
                "products": [
                    {"id": 1, "name": "", "price": 0, "stock": 0},  # Produto vazio
                    {"id": 2, "name": "A" * 1000, "price": 999999.99, "stock": 2147483647},  # Valores máximos
                    {"id": 3, "name": "Negative", "price": -10, "stock": -5}  # Valores negativos
                ]
            },
            dependencies=[]
        )

    def _create_demo_scenario(self) -> SeedDefinition:
        """Cria seed para demonstrações"""
        return SeedDefinition(
            name="demo",
            version="1.0.0",
            description="Dados realistas para demonstrações",
            tables={
                "users": [
                    {"id": 1, "email": "john.doe@company.com", "name": "John Doe", "role": "admin", "active": True},
                    {"id": 2, "email": "jane.smith@company.com", "name": "Jane Smith", "role": "user", "active": True},
                    {"id": 3, "email": "bob.wilson@company.com", "name": "Bob Wilson", "role": "user", "active": True}
                ],
                "products": [
                    {"id": 1, "name": "Enterprise Plan", "price": 499.99, "category": "subscription"},
                    {"id": 2, "name": "Pro Plan", "price": 99.99, "category": "subscription"},
                    {"id": 3, "name": "Basic Plan", "price": 29.99, "category": "subscription"}
                ],
                "orders": [
                    {"id": 1, "user_id": 2, "product_id": 1, "status": "completed", "total": 499.99},
                    {"id": 2, "user_id": 3, "product_id": 2, "status": "pending", "total": 99.99}
                ]
            },
            dependencies=[]
        )

    def save_seed(self, seed: SeedDefinition, overwrite: bool = False):
        """Salva um seed em arquivo"""
        if seed.name in self._registry and not overwrite:
            raise ValueError(f"Seed '{seed.name}' já existe. Use overwrite=True")

        seed_file = self.seeds_path / f"{seed.name}.json"

        seed_data = {
            "name": seed.name,
            "version": seed.version,
            "description": seed.description,
            "created_at": datetime.now().isoformat(),
            "tables": seed.tables,
            "dependencies": seed.dependencies,
            "checksum": self._calculate_checksum(seed.tables)
        }

        with open(seed_file, 'w', encoding='utf-8') as f:
            json.dump(seed_data, f, indent=2)

        self._registry[seed.name] = seed
        self._save_registry()

    def _calculate_checksum(self, tables: Dict) -> str:
        """Calcula checksum dos dados"""
        data = json.dumps(tables, sort_keys=True)
        return hashlib.sha256(data.encode()).hexdigest()[:16]

    def load_seed(self, name: str) -> Optional[SeedDefinition]:
        """Carrega um seed do arquivo"""
        seed_file = self.seeds_path / f"{name}.json"

        if not seed_file.exists():
            return None

        with open(seed_file, 'r', encoding='utf-8') as f:
            data = json.load(f)

        return SeedDefinition(
            name=data["name"],
            version=data.get("version", "1.0.0"),
            description=data.get("description", ""),
            tables=data["tables"],
            dependencies=data.get("dependencies", [])
        )

    def list_seeds(self) -> List[Dict]:
        """Lista todos os seeds disponíveis"""
        seeds = []
        for seed_file in self.seeds_path.glob("*.json"):
            if seed_file.name == ".registry.json":
                continue

            with open(seed_file, 'r', encoding='utf-8') as f:
                data = json.load(f)

            seeds.append({
                "name": data["name"],
                "version": data.get("version", "1.0.0"),
                "description": data.get("description", ""),
                "created_at": data.get("created_at", ""),
                "tables": list(data.get("tables", {}).keys()),
                "checksum": data.get("checksum", "")
            })

        return seeds

    def apply_seed(self, name: str, db_path: Path, dry_run: bool = False) -> Dict:
        """Aplica um seed no banco de dados"""
        seed = self.load_seed(name)
        if not seed:
            raise ValueError(f"Seed '{name}' não encontrado")

        if dry_run:
            return {"dry_run": True, "tables": list(seed.tables.keys()), "records": sum(len(v) for v in seed.tables.values())}

        # Aplica dependências primeiro
        for dep in seed.dependencies:
            self.apply_seed(dep, db_path)

        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()

        applied = {}
        for table_name, records in seed.tables.items():
            if not records:
                continue

            # Limpa tabela primeiro
            cursor.execute(f"DELETE FROM {table_name}")

            # Insere dados
            columns = list(records[0].keys())
            placeholders = ', '.join(['?' for _ in columns])
            column_names = ', '.join(columns)

            for record in records:
                values = [record.get(col) for col in columns]
                cursor.execute(f"""
                    INSERT INTO {table_name} ({column_names})
                    VALUES ({placeholders})
                """, values)

            applied[table_name] = len(records)

        conn.commit()
        conn.close()

        # Registra aplicação
        self._record_application(name, db_path)

        return {"applied": True, "tables": applied}

    def _record_application(self, seed_name: str, db_path: Path):
        """Registra aplicação do seed"""
        history_file = self.seeds_path / ".history.json"
        history = []

        if history_file.exists():
            with open(history_file, 'r', encoding='utf-8') as f:
                history = json.load(f)

        history.append({
            "seed": seed_name,
            "db_path": str(db_path),
            "applied_at": datetime.now().isoformat()
        })

        with open(history_file, 'w', encoding='utf-8') as f:
            json.dump(history, f, indent=2)

    def verify_seed(self, name: str) -> Dict:
        """Verifica integridade de um seed"""
        seed = self.load_seed(name)
        if not seed:
            return {"valid": False, "error": "Seed não encontrado"}

        current_checksum = self._calculate_checksum(seed.tables)
        seed_file = self.seeds_path / f"{name}.json"

        with open(seed_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
            stored_checksum = data.get("checksum", "")

        return {
            "valid": current_checksum == stored_checksum,
            "current_checksum": current_checksum,
            "stored_checksum": stored_checksum,
            "tables": len(seed.tables),
            "total_records": sum(len(v) for v in seed.tables.values())
        }


# Import random para os métodos que usam
import random


def main():
    parser = argparse.ArgumentParser(
        description="Seed Manager - GrowthOS",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python seed-manager.py --list
  python seed-manager.py --create-scenario=standard
  python seed-manager.py --create-scenario=minimal
  python seed-manager.py --apply=standard --db=./test.db
  python seed-manager.py --verify=standard
        """
    )

    parser.add_argument("--project", default=".", help="Caminho do projeto")
    parser.add_argument("--list", action="store_true", help="Listar seeds")
    parser.add_argument("--create-scenario", choices=["minimal", "standard", "stress", "edge_cases", "demo"],
                       help="Criar seed de cenário")
    parser.add_argument("--apply", help="Aplicar seed")
    parser.add_argument("--db", help="Caminho do banco de dados")
    parser.add_argument("--dry-run", action="store_true", help="Simular aplicação")
    parser.add_argument("--verify", help="Verificar seed")

    args = parser.parse_args()

    project_path = Path(args.project).resolve()
    manager = SeedManager(project_path)

    print(f"🌱 Seed Manager - GrowthOS")
    print(f"{'='*70}\n")

    if args.list:
        seeds = manager.list_seeds()
        print(f"Seeds disponíveis ({len(seeds)}):")
        for seed in seeds:
            print(f"\n  📦 {seed['name']} v{seed['version']}")
            print(f"     {seed['description']}")
            print(f"     Tabelas: {', '.join(seed['tables'])}")
            print(f"     Criado: {seed['created_at']}")

    elif args.create_scenario:
        print(f"Criando cenário: {args.create_scenario}")
        seed = manager.create_scenario(args.create_scenario)
        manager.save_seed(seed, overwrite=True)
        print(f"✅ Seed '{seed.name}' criado com sucesso!")
        print(f"   Tabelas: {list(seed.tables.keys())}")
        print(f"   Registros: {sum(len(v) for v in seed.tables.values())}")

    elif args.apply:
        if not args.db:
            print("❌ Erro: --db é obrigatório para aplicar seed")
            sys.exit(1)

        print(f"Aplicando seed '{args.apply}' em {args.db}")
        if args.dry_run:
            print("(Dry run - simulação)")

        try:
            result = manager.apply_seed(args.apply, Path(args.db), dry_run=args.dry_run)
            print(f"✅ Seed aplicado com sucesso!")
            print(f"   Tabelas: {result.get('tables', [])}")
        except Exception as e:
            print(f"❌ Erro: {e}")

    elif args.verify:
        result = manager.verify_seed(args.verify)
        print(f"Verificação de '{args.verify}':")
        print(f"  Válido: {'✅' if result['valid'] else '❌'}")
        print(f"  Checksum: {result['current_checksum']}")
        print(f"  Tabelas: {result['tables']}")
        print(f"  Registros: {result['total_records']}")

    else:
        parser.print_help()


if __name__ == "__main__":
    main()
