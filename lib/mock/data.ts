import type { MaturityDimension } from '@/lib/agents/types';

export const MOCK_WORKSPACE_ID = 'demo-workspace-id';

export const MOCK_BUSINESS_CONTEXT = {
  segment: 'SaaS B2B para PMEs de varejo',
  stage: 'growth',
  website: 'https://flywell.app',
  tam_sam_som: 'TAM R$4B, SAM R$800M, SOM R$80M',
  icp: {
    biz_type: 'B2B',
    description: 'Gerentes de marketing de varejos com 20–200 funcionários no Brasil',
    jbtd: 'Aumentar vendas sem contratar mais equipe de marketing',
    sales_cycle: '1–4 semanas',
  },
  positioning: {
    pod: 'Único orquestrador de growth com IA que adapta estratégias ao estágio da empresa',
    generic_strategy: 'Diferenciação',
    brand_salience: 'Conhecida no nicho',
    unfair_advantage: 'Base de dados proprietária de benchmarks de growth por segmento',
  },
  competitors: ['RD Station', 'HubSpot', 'ActiveCampaign'],
  competitive_analysis: {
    substitutes: 'Agências de marketing, consultores freelancers',
    entry_barriers: 'Moderadas',
    buyer_power: 'Moderado',
  },
  channels: ['Google Ads', 'SEO', 'Content', 'Parcerias'],
  ltv_cac: '3–5x',
  north_star_metric: 'MRR',
  growth_bottleneck: 'Conversão (baixo closing)',
  budget: 'R$20–100k',
  executive_summary:
    'Sua prioridade agora é orgânico e conteúdo — é o gap mais crítico do diagnóstico e, diferente de mídia paga, não some quando o orçamento aperta. Esta semana, publique os 3 artigos que respondem as perguntas mais comuns que seus clientes fazem antes de comprar; isso já começa a construir a autoridade que hoje está faltando.',
};

export const MOCK_BRAND_CONTEXT = {
  brief:
    'Flywell é a plataforma de growth marketing que substitui o achismo por dados verificados — diagnósticos ancorados em fontes externas reais (CNPJ, IBGE, PageSpeed, Wayback Machine) e squads de IA clonados de autoridades reais de branding e growth, não um chatbot genérico.',
  voice:
    'Profissional, direto e baseado em dados, sem jargões desnecessários, mas com autoridade analítica. Tom sóbrio e institucional — nunca flashy, sempre factual. Evita promessas mágicas ("IA mágica", "boost de 300%") e prefere números concretos e recomendações acionáveis.',
  archetype: 'Sábio + Criador',
  colors: ['#003e8a', '#0f172a', '#ffffff'],
  tagline: 'Flywell — Growth com dados reais, não com intuição.',
  manifesto:
    'A Flywell acredita que growth não é um jogo de adivinhação — é uma disciplina de evidência. No mundo saturado de promessas milagrosas e ferramentas fechadas que falam só consigo mesmas, construímos uma plataforma que substitui o achismo por dados verificados: cada insight é ancorado em fontes externas e contrastáveis — CNPJ, IBGE, PageSpeed Insights, Wayback Machine — e é entregue por squads de IA que encapsulam décadas de expertise real de branding, posicionamento e ciência de marketing. Não somos um chatbot genérico; somos uma consultoria estratégica em escala, projetada para o gestor não-técnico que precisa impressionar a diretoria com clareza, profundidade e credibilidade.\n\nNossa missão é democratizar o acesso a diagnósticos de qualidade de mercado para PMEs e mid-market brasileiras, que antes dependiam de agências caras ou de ferramentas que nunca saíram do ecossistema próprio. A Flywell é o motor que agentes chamam: uma arquitetura aberta, onde a lógica de negócio é exposta como serviço, permitindo que equipes explorem os mesmos dados verificados sem perder a humanidade da estratégia. Nosso produto é visualmente sóbrio, institucional e contido — porque a verdade que entregamos não precisa de efeitos especiais para causar impacto. A Flywell é growth com backing de dados, não de desculpas.',
  brandbook_url: null,
  research_results: {
    lenses: {
      digital_presence: { label: 'Presença Digital', result: 'Domain Rating estimado: 42. Orgânico em crescimento (+18% MoM). 320 keywords indexadas.' },
      positioning: { label: 'Posicionamento', result: 'Posicionamento claro no nicho de growth tech. Brand Gap moderado — diferenciação comunicada, mas awareness baixo.' },
      competitive: { label: 'Competitiva', result: 'Mercado com 3–4 concorrentes diretos fortes. Barreira de entrada moderada. Moat baseado em dados e IA.' },
      brand_equity: { label: 'Brand Equity (CBBE)', result: 'Salience: 2.5/5 | Performance: 3.8/5 | Imagery: 3.0/5 | Judgments: 3.5/5 | Feelings: 2.8/5 | Resonance: 2.2/5' },
    },
  },
};

export const MOCK_MATURITY_SCORES: Record<MaturityDimension, number> = {
  awareness_posicionamento: 2.8,
  aquisicao_paga: 3.2,
  organico_conteudo: 2.1,
  crm_lifecycle: 3.5,
  analytics_atribuicao: 2.4,
  diferenciacao_competitiva: 3.8,
  comunidade_movimento: 0, // not yet unlocked
};

export const MOCK_MATURITY_SCORES_DETAILED: Record<
  MaturityDimension,
  { score: number; rationale: string | null }
> = {
  awareness_posicionamento: {
    score: 2.8,
    rationale:
      'Marca reconhecida no nicho de growth tech, mas ainda sem share of voice fora dele — menção espontânea baixa em pesquisas de categoria.',
  },
  aquisicao_paga: {
    score: 3.2,
    rationale:
      'CAC pago dentro da média do setor, com ROAS consistente em Google Ads; falta diversificação de canal para reduzir dependência de uma única fonte.',
  },
  organico_conteudo: {
    score: 2.1,
    rationale:
      'Presença orgânica em estágio inicial — volume de conteúdo publicado é baixo frente aos concorrentes diretos, autoridade de domínio ainda em construção.',
  },
  crm_lifecycle: {
    score: 3.5,
    rationale:
      'Boa retenção e LTV:CAC saudável (3–5x), com fluxos de nutrição já implementados; oportunidade real em automação de reativação de churn.',
  },
  analytics_atribuicao: {
    score: 2.4,
    rationale:
      'Tracking básico funcional, mas atribuição multi-canal ainda não implementada — decisões de mídia paga carecem de visibilidade de funil completo.',
  },
  diferenciacao_competitiva: {
    score: 3.8,
    rationale:
      'Posicionamento diferenciado com moat real (dados proprietários + IA adaptativa), já citado por clientes como fator decisivo na escolha.',
  },
  comunidade_movimento: { score: 0, rationale: null },
};

export const MOCK_VISIBLE_MODULES = [
  { moduleKey: 'strategy', status: 'revealed' as const },
  { moduleKey: 'branding', status: 'active' as const },
  { moduleKey: 'analytics', status: 'revealed' as const },
];
