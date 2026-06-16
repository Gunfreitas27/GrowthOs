'use client'

import type { QuickAction } from '@/lib/agents/types'

interface QuickActionsProps {
  actions: QuickAction[]
  onAction: (prompt: string) => void
}

const DEFAULT_ACTIONS: QuickAction[] = [
  { label: '→ Analise meu funil', prompt: 'Analise meu funil atual e identifique os maiores gargalos de conversão com recomendações práticas.' },
  { label: '→ Crie estratégia de crescimento', prompt: 'Crie uma estratégia de crescimento completa para o próximo trimestre, do básico ao avançado.' },
  { label: '→ Sugira experimentos', prompt: 'Sugira 5 experimentos de alto impacto para aumentar minha taxa de ativação com scores ICE.' },
  { label: '→ Diagnóstico de canais', prompt: 'Analise meus canais de marketing atuais e recomende uma estratégia de alocação de budget otimizada.' },
  { label: '→ Loops de crescimento', prompt: 'Desenhe um growth loop viral para o meu produto baseado nas informações que você tem sobre minha empresa.' },
  { label: '→ Estratégia de retenção', prompt: 'Crie uma estratégia de retenção e redução de churn com sequência de ativação e habit loops.' },
]

export function QuickActions({ actions, onAction }: QuickActionsProps) {
  const displayActions = actions.length > 0 ? actions : DEFAULT_ACTIONS

  return (
    <div className="flex flex-wrap gap-2">
      {displayActions.map((action) => (
        <button
          key={action.label}
          onClick={() => onAction(action.prompt)}
          className="text-xs px-3 py-1.5 rounded-full transition-all duration-150 cursor-pointer"
          style={{
            background: 'rgba(107, 79, 232, 0.1)',
            border: '1px solid rgba(107, 79, 232, 0.25)',
            color: 'var(--velox-mist)',
            fontFamily: 'var(--font-ui)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(107, 79, 232, 0.2)'
            e.currentTarget.style.borderColor = 'rgba(107, 79, 232, 0.5)'
            e.currentTarget.style.color = '#F8F7FC'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(107, 79, 232, 0.1)'
            e.currentTarget.style.borderColor = 'rgba(107, 79, 232, 0.25)'
            e.currentTarget.style.color = 'var(--velox-mist)'
          }}
        >
          {action.label}
        </button>
      ))}
    </div>
  )
}
