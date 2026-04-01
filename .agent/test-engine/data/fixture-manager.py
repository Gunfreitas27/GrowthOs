#!/usr/bin/env python3
"""
Fixture Manager - Gerenciamento Inteligente de Dados de Teste
Inspirado no Ekyte - Fixtures, Factories e Seeds

Funcionalidades:
- Criação dinâmica de factories baseadas em schemas
- Gerenciamento de estados de teste
- Isolamento entre testes
- Seeds versionados
"""

import sys
import json
import os
import random
import string
from pathlib import Path
from typing import Dict, List, Any, Optional, Callable, Type
from dataclasses import dataclass, field
from datetime import datetime, timedelta
import sqlite3

# Fix Windows console encoding
try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')
except:
    pass


@dataclass
class FixtureDefinition:
    """Definição de uma fixture"""
    name: str
    entity: str
    template: Dict[str, Any]
    relationships: List[str] = field(default_factory=list)
    hooks: Dict[str, str] = field(default_factory=dict)


class FixtureRegistry:
    """Registro global de fixtures"""

    def __init__(self):
        self._fixtures: Dict[str, FixtureDefinition] = {}
        self._factories: Dict[str, 'BaseFactory'] = {}

    def register_fixture(self, fixture: FixtureDefinition):
        """Registra uma fixture"""
        self._fixtures[fixture.name] = fixture

    def get_fixture(self, name: str) -> Optional[FixtureDefinition]:
        """Obtém uma fixture pelo nome"""
        return self._fixtures.get(name)

    def register_factory(self, entity: str, factory: 'BaseFactory'):
        """Registra uma factory"""
        self._factories[entity] = factory

    def get_factory(self, entity: str) -> Optional['BaseFactory']:
        """Obtém uma factory pelo nome da entidade"""
        return self._factories.get(entity)

    def list_fixtures(self) -> List[str]:
        """Lista todas as fixtures registradas"""
        return list(self._fixtures.keys())


# Registro global
registry = FixtureRegistry()


class BaseFactory:
    """Factory base para criação de entidades"""

    def __init__(self, entity: str):
        self.entity = entity
        self._definitions: Dict[str, Callable] = {}
        self._sequences: Dict[str, int] = {}

    def define(self, field_name: str, definition: Callable):
        """Define um campo da factory"""
        self._definitions[field_name] = definition

    def sequence(self, field_name: str, start: int = 1):
        """Define um campo sequencial"""
        self._sequences[field_name] = start

        def get_next():
            current = self._sequences[field_name]
            self._sequences[field_name] += 1
            return current

        self._definitions[field_name] = get_next

    def make(self, overrides: Dict[str, Any] = None, count: int = 1) -> List[Dict]:
        """Cria instâncias da entidade"""
        overrides = overrides or {}
        results = []

        for _ in range(count):
            instance = {}
            for field_name, definition in self._definitions.items():
                if field_name in overrides:
                    instance[field_name] = overrides[field_name]
                else:
                    instance[field_name] = definition() if callable(definition) else definition

            results.append(instance)

        return results if count > 1 else results[0] if results else {}

    def create(self, overrides: Dict[str, Any] = None) -> Dict:
        """Cria uma instância da entidade"""
        return self.make(overrides, count=1)


class FixtureManager:
    """Gerenciador de fixtures do GrowthOS"""

    def __init__(self, fixtures_path: Path = None):
        self.fixtures_path = fixtures_path or Path(".agent/test-engine/fixtures")
        self.fixtures_path.mkdir(parents=True, exist_ok=True)
        self._loaded_fixtures: Dict[str, Any] = {}
        self._active_transactions: List[Dict] = []

    def load_fixture(self, name: str) -> Any:
        """Carrega uma fixture do disco ou registro"""
        if name in self._loaded_fixtures:
            return self._loaded_fixtures[name]

        # Tenta carregar do registro primeiro
        fixture_def = registry.get_fixture(name)
        if fixture_def:
            data = self._instantiate_fixture(fixture_def)
            self._loaded_fixtures[name] = data
            return data

        # Tenta carregar de arquivo
        fixture_file = self.fixtures_path / f"{name}.json"
        if fixture_file.exists():
            with open(fixture_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            self._loaded_fixtures[name] = data
            return data

        raise ValueError(f"Fixture '{name}' não encontrada")

    def _instantiate_fixture(self, fixture_def: FixtureDefinition) -> Dict:
        """Instancia uma fixture a partir da definição"""
        data = {}

        for key, value in fixture_def.template.items():
            if callable(value):
                data[key] = value()
            elif isinstance(value, str) and value.startswith("@"):
                # Referência a outra fixture
                ref_name = value[1:]
                data[key] = self.load_fixture(ref_name)
            else:
                data[key] = value

        return data

    def create_fixture(self, name: str, data: Dict):
        """Cria uma nova fixture"""
        fixture_file = self.fixtures_path / f"{name}.json"
        with open(fixture_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
        self._loaded_fixtures[name] = data

    def transaction_start(self):
        """Inicia uma transação de teste"""
        self._active_transactions.append({
            "fixtures": [],
            "start_time": datetime.now()
        })

    def transaction_rollback(self):
        """Rollback da transação de teste - limpa dados criados"""
        if self._active_transactions:
            transaction = self._active_transactions.pop()
            for fixture_name in transaction["fixtures"]:
                if fixture_name in self._loaded_fixtures:
                    del self._loaded_fixtures[fixture_name]

    def get_factory(self, entity: str) -> BaseFactory:
        """Obtém ou cria uma factory para uma entidade"""
        factory = registry.get_factory(entity)
        if factory:
            return factory

        # Cria factory dinâmica baseada em convenções
        factory = BaseFactory(entity)
        registry.register_factory(entity, factory)
        return factory


class DataFaker:
    """Gerador de dados fake para testes"""

    @staticmethod
    def email(domain: str = "example.com") -> str:
        """Gera email aleatório"""
        local = ''.join(random.choices(string.ascii_lowercase, k=10))
        return f"{local}@{domain}"

    @staticmethod
    def name() -> str:
        """Gera nome aleatório"""
        first_names = ["Alice", "Bob", "Charlie", "Diana", "Eve", "Frank",
                    "Grace", "Henry", "Ivy", "Jack", "Kate", "Leo"]
        last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones",
                     "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"]
        return f"{random.choice(first_names)} {random.choice(last_names)}"

    @staticmethod
    def uuid() -> str:
        """Gera UUID v4"""
        chars = string.hexdigits.lower()
        return f"{''.join(random.choices(chars, k=8))}-{''.join(random.choices(chars, k=4))}-{''.join(random.choices(chars, k=4))}-{''.join(random.choices(chars, k=4))}-{''.join(random.choices(chars, k=12))}"

    @staticmethod
    def password(length: int = 12) -> str:
        """Gera senha aleatória"""
        chars = string.ascii_letters + string.digits + "!@#$%^&*"
        return ''.join(random.choices(chars, k=length))

    @staticmethod
    def phone() -> str:
        """Gera telefone aleatório"""
        return f"+1{''.join(random.choices(string.digits, k=10))}"

    @staticmethod
    def date(days_range: int = 365) -> str:
        """Gera data aleatória"""
        delta = timedelta(days=random.randint(-days_range, days_range))
        date = datetime.now() + delta
        return date.strftime("%Y-%m-%d")

    @staticmethod
    def sentence(words: int = 6) -> str:
        """Gera frase aleatória"""
        word_list = ["lorem", "ipsum", "dolor", "sit", "amet", "consectetur",
                    "adipiscing", "elit", "sed", "do", "eiusmod", "tempor"]
        return ' '.join(random.choices(word_list, k=words)).capitalize() + "."

    @staticmethod
    def number(min_val: int = 0, max_val: int = 1000) -> int:
        """Gera número aleatório"""
        return random.randint(min_val, max_val)


class SeedManager:
    """Gerenciador de seeds de banco de dados"""

    def __init__(self, storage_path: Path = None):
        self.storage_path = storage_path or Path(".agent/test-engine/storage")
        self.seeds_path = self.storage_path / "seeds"
        self.seeds_path.mkdir(parents=True, exist_ok=True)

    def create_seed(self, name: str, data: Dict[str, List[Dict]]):
        """Cria um seed com dados"""
        seed_file = self.seeds_path / f"{name}.json"
        seed_data = {
            "name": name,
            "created_at": datetime.now().isoformat(),
            "tables": data
        }
        with open(seed_file, 'w', encoding='utf-8') as f:
            json.dump(seed_data, f, indent=2)

    def load_seed(self, name: str) -> Dict:
        """Carrega um seed"""
        seed_file = self.seeds_path / f"{name}.json"
        if not seed_file.exists():
            raise ValueError(f"Seed '{name}' não encontrado")

        with open(seed_file, 'r', encoding='utf-8') as f:
            return json.load(f)

    def list_seeds(self) -> List[str]:
        """Lista seeds disponíveis"""
        return [f.stem for f in self.seeds_path.glob("*.json")]

    def apply_seed(self, name: str, db_path: Path):
        """Aplica um seed em um banco SQLite"""
        seed = self.load_seed(name)

        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()

        for table_name, records in seed["tables"].items():
            for record in records:
                columns = list(record.keys())
                placeholders = ', '.join(['?' for _ in columns])
                column_names = ', '.join(columns)

                cursor.execute(f"""
                    INSERT INTO {table_name} ({column_names})
                    VALUES ({placeholders})
                """, tuple(record.values()))

        conn.commit()
        conn.close()


def create_default_factories():
    """Cria factories padrão para entidades comuns"""

    # Factory de Usuário
    user_factory = BaseFactory("user")
    user_factory.sequence("id")
    user_factory.define("email", DataFaker.email)
    user_factory.define("name", DataFaker.name)
    user_factory.define("password", lambda: DataFaker.password(16))
    user_factory.define("created_at", lambda: datetime.now().isoformat())
    user_factory.define("role", lambda: random.choice(["user", "admin", "editor"]))
    user_factory.define("active", lambda: True)
    registry.register_factory("user", user_factory)

    # Factory de Produto
    product_factory = BaseFactory("product")
    product_factory.sequence("id")
    product_factory.define("name", lambda: f"Product {DataFaker.sentence(3)}")
    product_factory.define("price", lambda: round(random.uniform(10, 1000), 2))
    product_factory.define("category", lambda: random.choice(["electronics", "clothing", "food"]))
    product_factory.define("stock", lambda: random.randint(0, 1000))
    registry.register_factory("product", product_factory)

    # Factory de Pedido
    order_factory = BaseFactory("order")
    order_factory.sequence("id")
    order_factory.define("user_id", lambda: random.randint(1, 100))
    order_factory.define("total", lambda: round(random.uniform(50, 5000), 2))
    order_factory.define("status", lambda: random.choice(["pending", "paid", "shipped", "delivered"]))
    order_factory.define("created_at", lambda: datetime.now().isoformat())
    registry.register_factory("order", order_factory)


# Inicializa factories padrão
create_default_factories()


def main():
    import argparse

    parser = argparse.ArgumentParser(
        description="Fixture Manager - GrowthOS",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )

    parser.add_argument("--list-factories", action="store_true", help="Listar factories")
    parser.add_argument("--create", help="Criar instância de factory")
    parser.add_argument("--count", type=int, default=1, help="Quantidade")
    parser.add_argument("--list-seeds", action="store_true", help="Listar seeds")
    parser.add_argument("--create-seed", help="Criar seed")

    args = parser.parse_args()

    if args.list_factories:
        print("Factories disponíveis:")
        for name in registry._factories.keys():
            print(f"  - {name}")

    elif args.create:
        factory = registry.get_factory(args.create)
        if factory:
            instances = factory.make(count=args.count)
            print(json.dumps(instances, indent=2))
        else:
            print(f"Factory '{args.create}' não encontrada")

    elif args.list_seeds:
        seed_manager = SeedManager()
        seeds = seed_manager.list_seeds()
        print("Seeds disponíveis:")
        for seed in seeds:
            print(f"  - {seed}")

    else:
        parser.print_help()


if __name__ == "__main__":
    main()
