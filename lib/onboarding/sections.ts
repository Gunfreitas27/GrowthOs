import type { QuestionnaireSection } from '@/components/onboarding/QuestionnaireCard';

// Plain-language by design: this is filled by a business owner/manager, not
// a growth specialist. Anything that requires growth expertise to answer
// (market sizing, "north star metric" methodology) is deliberately NOT asked
// here — the AI estimates it instead, from what IS easy to answer, in
// lib/business-context/estimate-market-sizing.ts. Framework names (Kotler,
// Porter, Keller...) stay out of the UI entirely; they're an implementation
// detail of which skill scores the answers, not something the user needs to
// know to answer a question.
export const ONBOARDING_SECTIONS: QuestionnaireSection[] = [
  {
    key: 'empresa',
    title: 'Sua Empresa',
    description: 'O básico sobre o seu negócio e onde ele atua.',
    questions: [
      {
        id: 'segment',
        label: 'Em que setor sua empresa atua?',
        type: 'text',
        placeholder: 'Ex: loja de suplementos, escritório de contabilidade, SaaS para clínicas, etc.',
      },
      {
        id: 'stage',
        label: 'Em que fase sua empresa está?',
        type: 'select',
        options: ['Pré-receita', 'Early stage', 'Crescimento', 'Escala', 'Maturidade'],
      },
      {
        id: 'website',
        label: 'Site da empresa',
        type: 'url',
        placeholder: 'https://suaempresa.com.br',
      },
    ],
  },
  {
    key: 'cliente',
    title: 'Seu Cliente',
    description: 'Quem compra de você e por quê.',
    questions: [
      {
        id: 'biz_type',
        label: 'Você vende para outras empresas ou para consumidor final?',
        type: 'select',
        options: ['B2B', 'B2C', 'B2B2C', 'Marketplace'],
      },
      {
        id: 'icp_description',
        label: 'Quem é o seu cliente mais comum?',
        type: 'text',
        placeholder: 'Ex: Gerentes de marketing de empresas de 50-200 funcionários no Brasil',
      },
      {
        id: 'jbtd',
        label: 'Que problema ele resolve comprando de você?',
        type: 'text',
        placeholder: 'Qual problema crítico seu produto resolve?',
      },
      {
        id: 'sales_cycle',
        label: 'Quanto tempo leva, em média, entre o primeiro contato e a venda?',
        type: 'select',
        options: ['< 1 dia', '1–7 dias', '1–4 semanas', '1–3 meses', '> 3 meses'],
      },
    ],
  },
  {
    key: 'posicionamento',
    title: 'Sua Marca',
    description: 'O que te diferencia e como o mercado te enxerga.',
    questions: [
      {
        id: 'pod',
        label: 'O que te diferencia dos concorrentes?',
        type: 'text',
        placeholder: 'O que só você oferece que nenhum concorrente tem?',
      },
      {
        id: 'generic_strategy',
        label: 'Como você compete no mercado, principalmente?',
        type: 'select',
        options: ['Preço mais baixo', 'Produto/serviço diferenciado', 'Foco em um nicho específico', 'Ainda definindo'],
      },
      {
        id: 'brand_salience',
        label: 'Sua marca é conhecida no mercado?',
        type: 'select',
        options: [
          'Desconhecida no mercado',
          'Conhecida por poucos',
          'Conhecida no nicho',
          'Referência no segmento',
          'Marca nacional/internacional',
        ],
      },
      {
        id: 'unfair_advantage',
        label: 'Tem algo seu que um concorrente não consegue copiar fácil?',
        type: 'text',
        placeholder: 'Patente, tecnologia própria, rede de contatos, dados, marca forte, etc.',
      },
    ],
  },
  {
    key: 'competicao',
    title: 'Sua Concorrência',
    description: 'Quem disputa o mesmo cliente que você.',
    questions: [
      {
        id: 'direct_competitors',
        label: 'Quem são seus principais concorrentes diretos?',
        type: 'text',
        placeholder: 'Liste os 3-5 principais concorrentes',
      },
      {
        id: 'substitutes',
        label: 'O que o cliente faria se você não existisse?',
        type: 'text',
        placeholder: 'Compraria de um concorrente, faria por conta própria, não resolveria o problema...',
      },
      {
        id: 'entry_barriers',
        label: 'É fácil para alguém novo entrar nesse mercado amanhã?',
        type: 'select',
        options: ['Muito fácil', 'Fácil', 'Moderado', 'Difícil', 'Muito difícil'],
      },
      {
        id: 'buyer_power',
        label: 'Seus clientes trocam de fornecedor com facilidade?',
        type: 'select',
        options: ['Quase nunca trocam', 'Raramente', 'Às vezes', 'Frequentemente', 'Trocam com muita facilidade'],
      },
    ],
  },
  {
    key: 'growth',
    title: 'Vendas e Marketing Hoje',
    description: 'Onde vocês estão agora em aquisição de clientes e resultado.',
    questions: [
      {
        id: 'active_channels',
        label: 'Por onde vocês conseguem clientes hoje?',
        type: 'multiselect',
        options: [
          'Google Ads',
          'Meta Ads',
          'SEO',
          'Content',
          'Email',
          'Outbound',
          'Parcerias',
          'Referral',
          'Orgânico redes sociais',
        ],
      },
      {
        id: 'ltv_cac_ratio',
        label: 'Pra cada R$1 gasto conquistando um cliente, quanto ele te traz de volta?',
        type: 'select',
        options: ['Não sei calcular', 'Menos do que gastei (< 1x)', 'O dobro (1–2x)', 'De 3 a 5 vezes', 'Mais de 5 vezes'],
      },
      {
        id: 'growth_bottleneck',
        label: 'Qual é o maior travamento pro crescimento hoje?',
        type: 'select',
        options: [
          'Aquisição (poucos leads)',
          'Conversão (baixo closing)',
          'Retenção (alto churn)',
          'Monetização (LTV baixo)',
          'Capacidade operacional',
        ],
      },
      {
        id: 'monthly_budget',
        label: 'Quanto vocês investem por mês em marketing?',
        type: 'select',
        options: ['< R$5k', 'R$5–20k', 'R$20–100k', 'R$100k–500k', '> R$500k'],
      },
    ],
  },
];
