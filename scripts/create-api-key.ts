import { createWorkspaceApiKey } from '@/lib/auth/api-keys';
import { db, workspaces } from '@/lib/db';
import { eq } from 'drizzle-orm';

async function main() {
  const [workspaceId, name] = process.argv.slice(2);

  if (!workspaceId || !name) {
    console.error('Uso: npm run create-api-key -- <workspaceId> <nome>');
    console.error('Exemplo: npm run create-api-key -- 3f2e... "Claude Desktop"');
    process.exit(1);
  }

  const workspace = await db.query.workspaces.findFirst({ where: eq(workspaces.id, workspaceId) });
  if (!workspace) {
    console.error(`[create-api-key] nenhum workspace encontrado com id ${workspaceId}`);
    console.error('Rode "npm run seed:demo-workspace" primeiro se ainda não tiver um workspace real.');
    process.exit(1);
  }

  const { plaintext, keyPrefix } = await createWorkspaceApiKey(workspaceId, name);

  console.error(`[create-api-key] criada para "${workspace.name}" (prefixo ${keyPrefix}).`);
  console.error('Guarde a chave abaixo agora — ela não será mostrada de novo:');
  console.log(plaintext);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[create-api-key] failed:', err);
    process.exit(1);
  });
