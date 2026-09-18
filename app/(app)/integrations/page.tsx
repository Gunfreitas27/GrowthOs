import { Puzzle, Plug } from 'lucide-react';
import { getCurrentWorkspaceId } from '@/lib/workspace/current';
import { resolveApiKeys, resolveConnections } from '@/lib/mock/resolver';
import { ApiKeyManager } from '@/components/integrations/ApiKeyManager';
import { ConnectionCard } from '@/components/integrations/ConnectionCard';
import { INTEGRATION_PROVIDERS, isProviderConfigured } from '@/lib/integrations/providers';

export default async function IntegrationsPage() {
  const workspaceId = await getCurrentWorkspaceId();
  const [rawKeys, connections] = await Promise.all([
    resolveApiKeys(workspaceId),
    resolveConnections(workspaceId),
  ]);

  const keys = rawKeys.map((k) => ({
    id: k.id,
    name: k.name,
    keyPrefix: k.keyPrefix,
    createdAt: k.createdAt instanceof Date ? k.createdAt.toISOString() : String(k.createdAt),
    lastUsedAt: k.lastUsedAt instanceof Date ? k.lastUsedAt.toISOString() : k.lastUsedAt ? String(k.lastUsedAt) : null,
  }));

  const connectionByProvider = new Map(connections.map((c) => [c.platform, c]));

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-xl bg-surface-strong flex items-center justify-center">
          <Puzzle size={18} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Integrações</h1>
          <p className="text-sm text-muted-foreground">
            Conecte agentes externos e suas fontes de dados — disponível pra qualquer workspace, sem depender do diagnóstico.
          </p>
        </div>
      </div>

      <ApiKeyManager initialKeys={keys} />

      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <Plug size={16} className="text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground">Redes sociais e mídia paga</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {Object.values(INTEGRATION_PROVIDERS).map((p) => {
            const conn = connectionByProvider.get(p.id);
            return (
              <ConnectionCard
                key={p.id}
                id={p.id}
                label={p.label}
                category={p.category}
                configured={isProviderConfigured(p.id)}
                connected={conn?.status === 'connected'}
                lastSync={conn?.lastSync ? (conn.lastSync instanceof Date ? conn.lastSync.toISOString() : String(conn.lastSync)) : null}
              />
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          "Requer configuração" significa que essa plataforma ainda não tem um app OAuth registrado pra esse workspace — cada uma exige o próprio cadastro no console de desenvolvedor dela antes de aparecer como conectável.
        </p>
      </div>
    </div>
  );
}
