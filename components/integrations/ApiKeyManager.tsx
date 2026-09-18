'use client';

import { useState } from 'react';
import { Copy, Check, Trash2, KeyRound } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface ApiKeySummary {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: string;
  lastUsedAt: string | null;
}

function formatDate(iso: string | null) {
  if (!iso) return 'nunca usada';
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function ApiKeyManager({ initialKeys }: { initialKeys: ApiKeySummary[] }) {
  const [keys, setKeys] = useState(initialKeys);
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const [justCreated, setJustCreated] = useState<{ plaintext: string; keyPrefix: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const createKey = async () => {
    if (!name.trim() || creating) return;
    setCreating(true);
    try {
      const res = await fetch('/api/integrations/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) throw new Error('Falha ao gerar chave');
      const data = (await res.json()) as { plaintext: string; keyPrefix: string };
      setJustCreated(data);
      setKeys((prev) => [
        { id: data.keyPrefix, name: name.trim(), keyPrefix: data.keyPrefix, createdAt: new Date().toISOString(), lastUsedAt: null },
        ...prev,
      ]);
      setName('');
    } catch {
      // Silent — the form stays filled so the user can just retry.
    } finally {
      setCreating(false);
    }
  };

  const revokeKey = async (id: string) => {
    setKeys((prev) => prev.filter((k) => k.id !== id));
    await fetch('/api/integrations/api-keys', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    }).catch(() => {});
  };

  const copyKey = async () => {
    if (!justCreated) return;
    await navigator.clipboard.writeText(justCreated.plaintext).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {justCreated && (
        <Card className="p-5 bg-warning/5">
          <p className="text-xs font-semibold uppercase tracking-wide text-warning mb-2">
            Guarde essa chave agora — ela não aparece de novo
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm bg-surface-strong rounded-md px-3 py-2 overflow-x-auto whitespace-nowrap text-foreground">
              {justCreated.plaintext}
            </code>
            <Button size="sm" variant="secondary" onClick={copyKey}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copiado' : 'Copiar'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Pra conectar no Claude Code:
          </p>
          <code className="block text-xs bg-surface-strong rounded-md px-3 py-2 mt-1 overflow-x-auto whitespace-pre text-foreground">
            {`claude mcp add --transport http delfo https://flaywell.vercel.app/api/mcp --header "Authorization: Bearer ${justCreated.plaintext}"`}
          </code>
        </Card>
      )}

      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <KeyRound size={16} className="text-primary" />
          <p className="text-sm font-semibold text-foreground">Chaves de API (MCP)</p>
        </div>

        {keys.length > 0 && (
          <div className="space-y-2 mb-4">
            {keys.map((k) => (
              <div key={k.id} className="flex items-center justify-between rounded-md bg-surface-soft px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium text-foreground">{k.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {k.keyPrefix}… · criada em {formatDate(k.createdAt)} · última vez usada: {formatDate(k.lastUsedAt)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => revokeKey(k.id)}
                  className="text-muted-foreground hover:text-danger transition-colors p-1.5"
                  aria-label={`Revogar chave ${k.name}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Input
            placeholder="Nome da chave (ex: Claude Desktop, ChatGPT)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && createKey()}
          />
          <Button onClick={createKey} disabled={!name.trim() || creating} className="shrink-0">
            {creating ? 'Gerando...' : 'Gerar chave'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
