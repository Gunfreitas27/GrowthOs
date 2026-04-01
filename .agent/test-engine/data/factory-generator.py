#!/usr/bin/env python3
"""
Factory Generator - Geração Automática de Factories
Inspirado no Ekyte - Gera factories a partir de schemas TypeScript, Prisma, etc.

Funcionalidades:
- Parse de schemas Prisma
- Parse de interfaces TypeScript
- Geração automática de factories
- Detecção de relacionamentos
"""

import sys
import json
import re
from pathlib import Path
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
import argparse

# Fix Windows console encoding
try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')
except:
    pass


@dataclass
class FieldDefinition:
    """Definição de campo"""
    name: str
    type: str
    optional: bool
    default: Optional[Any] = None
    is_relation: bool = False
    is_enum: bool = False


@dataclass
class EntityDefinition:
    """Definição de entidade"""
    name: str
    fields: List[FieldDefinition]
    relations: List[str]


class PrismaParser:
    """Parser de schemas Prisma"""

    TYPE_MAPPING = {
        "String": "faker.sentence()",
        "Int": "faker.number()",
        "Float": "faker.float()",
        "Boolean": "faker.boolean()",
        "DateTime": "faker.datetime()",
        "Json": "faker.json()",
        "Bytes": "faker.bytes()",
        "BigInt": "faker.bigint()",
        "Decimal": "faker.decimal()"
    }

    def parse(self, schema_path: Path) -> List[EntityDefinition]:
        """Parse de arquivo schema.prisma"""
        content = schema_path.read_text(encoding='utf-8')

        entities = []

        # Regex para encontrar modelos
        model_pattern = r'model\s+(\w+)\s*\{([^}]+)\}'
        matches = re.findall(model_pattern, content, re.DOTALL)

        for name, fields_block in matches:
            fields = self._parse_fields(fields_block)
            relations = [f.name for f in fields if f.is_relation]

            entities.append(EntityDefinition(
                name=name,
                fields=fields,
                relations=relations
            ))

        return entities

    def _parse_fields(self, fields_block: str) -> List[FieldDefinition]:
        """Parse dos campos de um modelo"""
        fields = []
        lines = fields_block.strip().split('\n')

        for line in lines:
            line = line.strip()
            if not line or line.startswith('//') or line.startswith('@'):
                continue

            # Parse de campo: nome Tipo @atributos?
            match = re.match(r'(\w+)\s+(\??[\w\[\]]+)\s*(@.*)?', line)
            if match:
                name = match.group(1)
                type_str = match.group(2)
                attributes = match.group(3) or ""

                optional = type_str.startswith('?') or '?' in type_str
                is_relation = '@relation' in attributes or type_str[0].isupper()
                is_enum = False

                # Remove ? do tipo
                clean_type = type_str.lstrip('?')

                # Extrai default se existir
                default = None
                default_match = re.search(r'@default\(([^)]+)\)', attributes)
                if default_match:
                    default = default_match.group(1)

                fields.append(FieldDefinition(
                    name=name,
                    type=clean_type,
                    optional=optional,
                    default=default,
                    is_relation=is_relation,
                    is_enum=is_enum
                ))

        return fields


class TypeScriptParser:
    """Parser de interfaces TypeScript"""

    def parse(self, file_path: Path) -> List[EntityDefinition]:
        """Parse de arquivo TypeScript"""
        content = file_path.read_text(encoding='utf-8')

        entities = []

        # Regex para interfaces
        interface_pattern = r'interface\s+(\w+)\s*\{([^}]+)\}'
        matches = re.findall(interface_pattern, content, re.DOTALL)

        for name, fields_block in matches:
            fields = self._parse_ts_fields(fields_block)
            entities.append(EntityDefinition(
                name=name,
                fields=fields,
                relations=[]
            ))

        # Regex para types
        type_pattern = r'type\s+(\w+)\s*=\s*\{([^}]+)\}'
        type_matches = re.findall(type_pattern, content, re.DOTALL)

        for name, fields_block in type_matches:
            fields = self._parse_ts_fields(fields_block)
            entities.append(EntityDefinition(
                name=name,
                fields=fields,
                relations=[]
            ))

        return entities

    def _parse_ts_fields(self, fields_block: str) -> List[FieldDefinition]:
        """Parse dos campos TypeScript"""
        fields = []
        lines = fields_block.strip().split('\n')

        for line in lines:
            line = line.strip()
            if not line or line.startswith('//'):
                continue

            # Parse: nome: Tipo;
            match = re.match(r'(\w+)\??\s*:\s*([^;]+);?', line)
            if match:
                name = match.group(1)
                type_str = match.group(2).strip()
                optional = '?' in line

                fields.append(FieldDefinition(
                    name=name,
                    type=type_str,
                    optional=optional
                ))

        return fields


class FactoryGenerator:
    """Gerador de código de factories"""

    def __init__(self):
        self.prisma_parser = PrismaParser()
        self.ts_parser = TypeScriptParser()

    def generate_from_prisma(self, schema_path: Path) -> Dict[str, str]:
        """Gera factories a partir de schema Prisma"""
        entities = self.prisma_parser.parse(schema_path)
        return {entity.name: self._generate_factory_code(entity) for entity in entities}

    def generate_from_typescript(self, file_path: Path) -> Dict[str, str]:
        """Gera factories a partir de TypeScript"""
        entities = self.ts_parser.parse(file_path)
        return {entity.name: self._generate_factory_code(entity) for entity in entities}

    def _generate_factory_code(self, entity: EntityDefinition) -> str:
        """Gera código Python para uma factory"""
        lines = [
            f"# Auto-generated factory for {entity.name}",
            "",
            "from fixture_manager import BaseFactory, DataFaker, registry",
            "",
            f"def create_{entity.name.lower()}_factory():",
            f'    factory = BaseFactory("{entity.name.lower()}")',
            "",
            "    # Sequences",
            '    factory.sequence("id")',
            "",
            "    # Fields",
        ]

        for field in entity.fields:
            if field.is_relation:
                continue  # Pula relacionamentos

            faker_call = self._get_faker_call(field)
            lines.append(f'    factory.define("{field.name}", {faker_call})')

        lines.extend([
            "",
            "    return factory",
            "",
            f'# Register factory',
            f'factory = create_{entity.name.lower()}_factory()',
            f'registry.register_factory("{entity.name.lower()}", factory)'
        ])

        return '\n'.join(lines)

    def _get_faker_call(self, field: FieldDefinition) -> str:
        """Determina qual função faker usar baseado no tipo"""
        type_lower = field.type.lower()

        if 'email' in field.name.lower():
            return "DataFaker.email"
        elif 'name' in field.name.lower() and 'user' in field.name.lower():
            return "DataFaker.name"
        elif 'password' in field.name.lower():
            return "DataFaker.password"
        elif 'phone' in field.name.lower():
            return "DataFaker.phone"
        elif 'date' in field.name.lower():
            return "DataFaker.date"
        elif 'uuid' in field.name.lower() or 'id' in field.name.lower():
            return "DataFaker.uuid"
        elif 'price' in field.name.lower() or 'amount' in field.name.lower():
            return 'lambda: round(random.uniform(10, 1000), 2)'
        elif 'description' in field.name.lower() or 'text' in field.name.lower():
            return "lambda: DataFaker.sentence(10)"

        # Mapeamento por tipo
        if type_lower == 'string':
            return "lambda: DataFaker.sentence(3)"
        elif type_lower == 'int' or type_lower == 'integer':
            return "lambda: DataFaker.number(1, 1000)"
        elif type_lower == 'float' or type_lower == 'number':
            return "lambda: round(random.uniform(0, 100), 2)"
        elif type_lower == 'boolean':
            return "lambda: random.choice([True, False])"
        elif type_lower == 'datetime':
            return "DataFaker.date"
        elif '[]' in type_lower:
            return "lambda: []"
        else:
            return "lambda: None"

    def save_factories(self, factories: Dict[str, str], output_path: Path):
        """Salva factories em arquivos"""
        output_path.mkdir(parents=True, exist_ok=True)

        for name, code in factories.items():
            file_path = output_path / f"{name.lower()}_factory.py"
            file_path.write_text(code, encoding='utf-8')
            print(f"Created: {file_path}")


def main():
    parser = argparse.ArgumentParser(
        description="Factory Generator - GrowthOS",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python factory-generator.py --prisma=prisma/schema.prisma --out=.agent/test-engine/factories
  python factory-generator.py --typescript=src/types.ts --out=.agent/test-engine/factories
        """
    )

    parser.add_argument("--prisma", help="Path to schema.prisma")
    parser.add_argument("--typescript", help="Path to TypeScript file")
    parser.add_argument("--out", default=".agent/test-engine/factories",
                       help="Output directory")

    args = parser.parse_args()

    generator = FactoryGenerator()
    output_path = Path(args.out)

    if args.prisma:
        print(f"Generating factories from Prisma schema: {args.prisma}")
        factories = generator.generate_from_prisma(Path(args.prisma))
        generator.save_factories(factories, output_path)
        print(f"Generated {len(factories)} factories")

    elif args.typescript:
        print(f"Generating factories from TypeScript: {args.typescript}")
        factories = generator.generate_from_typescript(Path(args.typescript))
        generator.save_factories(factories, output_path)
        print(f"Generated {len(factories)} factories")

    else:
        parser.print_help()


if __name__ == "__main__":
    main()
