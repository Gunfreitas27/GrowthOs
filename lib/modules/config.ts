import type { ComponentType } from 'react';
import { TrendingUp, Search, Users, SendHorizontal, Zap, FolderKanban, Puzzle } from 'lucide-react';
import type { ModuleKey } from '@/lib/agents/types';

export interface LockedModuleMeta {
  label: string;
  description: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  agentMessage: string;
}

// Modules with no real page built yet (strategy/branding/analytics have
// their own route and never go through the generic locked-preview) — one
// entry per module in this state, so the agent always has something
// concrete to say about what unlocks it.
export const LOCKED_MODULE_META: Partial<Record<ModuleKey, LockedModuleMeta>> = {
  paid: {
    label: 'Tráfego Pago',
    description: 'Otimização de investimento em mídia paga, com recomendação de orçamento por canal.',
    icon: TrendingUp,
    agentMessage:
      'Ainda não tenho dado suficiente sobre como vocês adquirem clientes pagos. Termine a seção "Vendas e Marketing" do diagnóstico e me conte mais sobre seus canais numa conversa — é isso que libera recomendação de orçamento aqui.',
  },
  seo: {
    label: 'SEO & Conteúdo',
    description: 'Prioridades de conteúdo e SEO técnico, ordenadas por potencial de tráfego orgânico.',
    icon: Search,
    agentMessage:
      'Preciso entender melhor sua presença orgânica hoje. Termine o diagnóstico e, se ainda não passou, me diga a URL do seu site numa conversa — uso isso pra calibrar esse módulo.',
  },
  crm: {
    label: 'CRM',
    description: 'Funil de vendas e acompanhamento de relacionamento com o cliente, com pontuação de leads.',
    icon: Users,
    agentMessage:
      'Esse é o módulo que mais exige maturidade — preciso de um quadro mais completo do seu funil antes de liberar. Continue conversando comigo sobre como vocês administram leads hoje.',
  },
  outbound: {
    label: 'Outbound',
    description: 'Sequências de prospecção ativa e acompanhamento de taxa de resposta.',
    icon: SendHorizontal,
    agentMessage:
      'Ainda não tenho contexto suficiente sobre sua operação comercial. Termine o diagnóstico e me conte, numa conversa, como funciona hoje sua prospecção ativa.',
  },
  community: {
    label: 'Comunidade',
    description: 'Engajamento e construção de movimento em torno da marca — para além do funil de vendas.',
    icon: Zap,
    agentMessage:
      'Esse é o módulo mais avançado da régua — normalmente libera depois que Estratégia, Branding e Analytics já estiverem rodando. Continue evoluindo os módulos já desbloqueados.',
  },
  project: {
    label: 'Projetos',
    description: 'As iniciativas do seu plano de growth organizadas como projetos, do plano à execução.',
    icon: FolderKanban,
    agentMessage:
      'Preciso ver alguma iniciativa de growth já em andamento antes de organizar isso como projeto. Comece pela Estratégia — o plano de 90 dias vira sua primeira base aqui.',
  },
  integrations: {
    label: 'Integrações',
    description:
      'Conecte suas próprias fontes de dados para enriquecer os diagnósticos com o contexto real do seu negócio.',
    icon: Puzzle,
    agentMessage:
      'Esse é o módulo mais simples de desbloquear — qualquer dado de maturidade já conta. Deve estar quase pronto; se ainda não abriu, complete mais uma seção do diagnóstico.',
  },
};
