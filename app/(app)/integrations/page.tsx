import { Puzzle, Plug } from 'lucide-react';
import { getCurrentWorkspaceId } from '@/lib/workspace/current';
import { resolveApiKeys } from '@/lib/mock/resolver';
import { ApiKeyManager } from '@/components/integrations/ApiKeyManager';

const COMING_SOON_PROVIDERS = [
  { name: 'Google Ads', category: 'Mídia paga' },
  { name: 'Meta Ads', category: 'Mídia paga' },
  { name: 'Google Analytics', category: 'Dados de site' },
  { name: 'Instagram', category: 'Rede social' },
  { name: 'LinkedIn', category: 'Rede social' },
  { name: 'TikTok', category: 'Rede social' },
];

export default async function IntegrationsPage() {
  const workspaceId = await getCurrentWorkspaceId();
  const rawKeys = await resolveApiKeys(workspaceId);
  const keys = rawKeys.map((k) => ({
    id: k.id,
    name: k.name,
    keyPrefix: k.keyPrefix,
    createdAt: k.createdAt instanceof Date ? k.createdAt.toISOString() : String(k.createdAt),
    lastUsedAt: k.lastUsedAt instanceof Date ? k.lastUsedAt.toISOString() : k.lastUsedAt ? String(k.lastUsedAt) : null,
  }));

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
          {COMING_SOON_PROVIDERS.map((p) => (
            <div
              key={p.name}
              className="rounded-xl bg-card shadow-elevated p-4 flex items-center justify-between opacity-70"
            >
              <div>
                <p className="text-sm font-medium text-foreground">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.category}</p>
              </div>
              <span className="text-[11px] font-medium text-muted-foreground bg-surface-strong rounded-pill px-2.5 py-1">
                Em breve
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Conexão direta com contas de mídia paga e redes sociais ainda não está disponível — cada uma exige registro próprio junto à plataforma (Google, Meta, etc.). Avise qual quer priorizar.
        </p>
      </div>
    </div>
  );
}
