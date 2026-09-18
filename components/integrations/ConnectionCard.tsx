'use client';

import { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';

export interface ConnectionCardProps {
  id: string;
  label: string;
  category: string;
  configured: boolean;
  connected: boolean;
  lastSync: string | null;
}

export function ConnectionCard({ id, label, category, configured, connected, lastSync }: ConnectionCardProps) {
  const [isConnected, setIsConnected] = useState(connected);
  const [disconnecting, setDisconnecting] = useState(false);

  const disconnect = async () => {
    setDisconnecting(true);
    try {
      await fetch(`/api/integrations/connections/${id}`, { method: 'DELETE' });
      setIsConnected(false);
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <div className="rounded-xl bg-card shadow-elevated p-4 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">
          {category}
          {isConnected && lastSync && ` · sincronizado em ${new Date(lastSync).toLocaleDateString('pt-BR')}`}
        </p>
      </div>

      {isConnected ? (
        <button
          type="button"
          onClick={disconnect}
          disabled={disconnecting}
          className="flex items-center gap-1.5 text-[11px] font-medium text-success bg-success/10 rounded-pill px-2.5 py-1 hover:bg-danger/10 hover:text-danger transition-colors"
        >
          {disconnecting ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
          Conectado
        </button>
      ) : configured ? (
        <a
          href={`/api/integrations/oauth/${id}/start`}
          className="text-[11px] font-semibold text-primary-foreground bg-primary rounded-pill px-3 py-1.5 hover:bg-primary-hover transition-colors"
        >
          Conectar
        </a>
      ) : (
        <span className="text-[11px] font-medium text-muted-foreground bg-surface-strong rounded-pill px-2.5 py-1">
          Requer configuração
        </span>
      )}
    </div>
  );
}
