# Velox — Brand Identity & Implementation Guide
> Envie este arquivo para o Claude Code. Ele contém toda a identidade de marca + instruções de implementação no seu projeto TSX.

---

## CONTEXTO PARA O CLAUDE CODE

Este é um Growth Team OS construído em TSX. O projeto já tem dashboard/visualizações. Implemente a identidade de marca **Velox** descrita abaixo em todo o codebase — design tokens, componentes, tipografia, paleta de cores e copy.

---

## 1. IDENTIDADE CENTRAL

| Atributo | Valor |
|---|---|
| **Nome** | Velox |
| **Tagline** | Run growth. Not chaos. |
| **One-liner** | Velox é o sistema operacional para times de growth — onde experimentos são priorizados, funis são monitorados, e cada aprendizado se torna a base do próximo teste. |
| **Posicionamento** | Growth Team OS — único sistema construído especificamente para times de growth |
| **Palavra a possuir** | velocity |
| **Arquétipo primário** | O Mago — transforma caos em sistema |
| **Arquétipo secundário** | O Sábio — evidence-based, ICE/RICE, método visível |

---

## 2. DESIGN TOKENS — implementar como CSS custom properties e/ou Tailwind config

### 2.1 Paleta de Cores

```css
:root {
  /* Brand Colors */
  --velox-void:        #0F0E1A; /* Background dark mode principal */
  --velox-indigo:      #2D1B6B; /* Brand color principal */
  --velox-pulse:       #6B4FE8; /* CTAs, interativos, ICE/RICE score highlight */
  --velox-velocity:    #1AD3C5; /* Wins, sucesso, destaques de velocidade */
  --velox-insight:     #F59E0B; /* Learnings importantes, alertas de atenção */
  --velox-signal:      #EF4444; /* Losses, drops de funil, alertas críticos */
  --velox-cloud:       #F8F7FC; /* Background light mode */
  --velox-mist:        #A8A3C7; /* Texto secundário */

  /* Derived tokens */
  --velox-pulse-10:    #6B4FE81A; /* Pulse com 10% opacidade — backgrounds de cards */
  --velox-pulse-20:    #6B4FE833; /* Pulse com 20% opacidade — borders de destaque */
  --velox-velocity-10: #1AD3C51A; /* Velocity com 10% — success states */
  --velox-insight-10:  #F59E0B1A; /* Insight com 10% — warning states */
  --velox-signal-10:   #EF44441A; /* Signal com 10% — error/loss states */
  --velox-indigo-40:   #2D1B6B66; /* Indigo 40% — subtle brand surfaces */
}
```

### 2.2 Tailwind Config (se o projeto usar Tailwind)

```javascript
// tailwind.config.js — adicionar dentro de theme.extend.colors
colors: {
  velox: {
    void:        '#0F0E1A',
    indigo:      '#2D1B6B',
    pulse:       '#6B4FE8',
    velocity:    '#1AD3C5',
    insight:     '#F59E0B',
    signal:      '#EF4444',
    cloud:       '#F8F7FC',
    mist:        '#A8A3C7',
  }
}
```

### 2.3 Semântica de Cores por Contexto

| Contexto | Cor | Uso |
|---|---|---|
| CTA primário | `--velox-pulse` | Botões de ação principais |
| Win / Sucesso | `--velox-velocity` | Badge "win", experimento bem-sucedido |
| Learning / Insight | `--velox-insight` | Cards de learning, highlights |
| Loss / Alerta crítico | `--velox-signal` | Badge "loss", drop de funil |
| Inconclusive | `--velox-mist` | Badge "inconclusive", estados neutros |
| Score (ICE/RICE) | `--velox-pulse` em mono | Valores numéricos de score |
| Background dark | `--velox-void` | Dark mode base |
| Brand surface | `--velox-indigo` | Headers, sidebar, brand moments |

---

## 3. TIPOGRAFIA

### 3.1 Google Fonts — adicionar ao projeto

```html
<!-- No <head> do index.html ou _document.tsx -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### 3.2 Font Stack CSS

```css
:root {
  --font-display: 'Plus Jakarta Sans', system-ui, sans-serif;
  --font-ui:      'Inter', system-ui, sans-serif;
  --font-data:    'JetBrains Mono', 'Fira Code', monospace;
}

body {
  font-family: var(--font-ui);
}
```

### 3.3 Uso por Contexto

| Fonte | Peso | Contexto |
|---|---|---|
| Plus Jakarta Sans | 700–800 | Headlines, hero sections, títulos de página |
| Inter | 400–500 | Toda a interface, labels, navegação, body text |
| JetBrains Mono | 400–500 | ICE scores, RICE scores, valores numéricos, status, métricas |

### 3.4 Classes de Tipografia Recomendadas

```css
.velox-display {
  font-family: var(--font-display);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.velox-heading {
  font-family: var(--font-display);
  font-weight: 700;
  letter-spacing: -0.01em;
}

.velox-body {
  font-family: var(--font-ui);
  font-weight: 400;
  line-height: 1.6;
}

.velox-label {
  font-family: var(--font-ui);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.velox-data {
  font-family: var(--font-data);
  font-weight: 500;
}
```

---

## 4. COMPONENTES — especificações de implementação

### 4.1 Score Badge (ICE/RICE)

```tsx
// Exemplo de implementação TSX
interface ScoreBadgeProps {
  type: 'ICE' | 'RICE';
  value: number;
  size?: 'sm' | 'md';
}

// Visual: fundo --velox-pulse-10, borda --velox-pulse-20
// Texto: font-data, color --velox-pulse
// Formato: "ICE 8.4" ou "RICE 247"
```

### 4.2 Result Badge

```tsx
// win      → bg: --velox-velocity-10, color: --velox-velocity, borda: --velox-velocity-10*2
// loss     → bg: --velox-signal-10, color: --velox-signal
// inconclusive → bg: mist/10, color: --velox-mist
// running  → bg: --velox-pulse-10, color: --velox-pulse, com dot animado
```

### 4.3 KPI Card

```tsx
// Estrutura:
// - label: font-label, --velox-mist
// - valor: font-display 700, 28-32px, --color-text-primary
// - delta: font-data 12px, verde se positivo (--velox-velocity), vermelho se negativo (--velox-signal)
// - border-left: 3px solid --velox-pulse (cards de destaque)
```

### 4.4 Botão Primário

```css
.btn-primary {
  background: linear-gradient(135deg, #6B4FE8, #1AD3C5);
  color: white;
  font-family: var(--font-ui);
  font-weight: 600;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
}

.btn-primary:hover {
  opacity: 0.92;
  transform: translateY(-1px);
}
```

### 4.5 Dark Mode

```css
/* O dark mode é o modo padrão/prioritário da marca */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary:    #0F0E1A; /* --velox-void */
    --bg-secondary:  #1A182E;
    --bg-tertiary:   #251F3D;
    --text-primary:  #F8F7FC;
    --text-secondary: #A8A3C7;
    --border:        rgba(107, 79, 232, 0.15);
  }
}

@media (prefers-color-scheme: light) {
  :root {
    --bg-primary:    #F8F7FC; /* --velox-cloud */
    --bg-secondary:  #FFFFFF;
    --bg-tertiary:   #F0EEF8;
    --text-primary:  #0F0E1A;
    --text-secondary: #6B6694;
    --border:        rgba(45, 27, 107, 0.12);
  }
}
```

---

## 5. COPY & VOZ DA MARCA

### 5.1 Headlines por Página/Seção

| Seção | Headline sugerida |
|---|---|
| Dashboard (home) | "Your growth at a glance." |
| Backlog vazio | "Nenhum experimento ainda. Por onde começar?" |
| Primeiro win | "Primeiro win. O sistema está funcionando." |
| Sem learnings | "Seus learnings vivem aqui. Comece pelo último experimento." |
| Funil (gargalo) | "[Etapa] está freando seu crescimento. 3 experimentos ativos aqui." |
| Dashboard de velocidade | "Sprint velocity: X exp/mês. Meta: Y." |

### 5.2 Estados Vazios (Empty States)

```
Backlog vazio:
"Nenhum experimento no backlog.
Adicione uma ideia e o Velox calcula o score automaticamente."

Learnings vazio:
"Nenhum learning registrado ainda.
Cada experimento concluído gera um aprendizado. Comece pelo backlog."

Funil sem dados:
"Registre seu primeiro snapshot de funil.
5 minutos agora = tendências visíveis em 2 semanas."
```

### 5.3 Tom — Checklist rápido

- ✅ Direto. Sem floreio.
- ✅ Dados antes de adjetivos.
- ✅ Verbos fortes: ship, run, track, learn, compound.
- ❌ "plataforma robusta", "solução end-to-end", "transformação digital"
- ❌ Exclamações.
- ❌ "incrível", "poderoso", "revolucionário"

### 5.4 Vocabulário Padrão

| Use | Não use |
|---|---|
| experimento | teste |
| learning | resultado |
| pipeline | processo |
| score | nota / pontuação |
| ship | implementar / lançar |
| velocity | velocidade |
| compound | crescimento acumulado |

---

## 6. LOGO — direção para implementação

### 6.1 Wordmark

- Texto: "velox" em caixa baixa
- Fonte: Plus Jakarta Sans 700 (não 800)
- Letter-spacing: -0.02em
- O "x" final pode ter leve inclinação de 5° (transform: skewX(-5deg) apenas no caractere)

### 6.2 Ícone / Brand Mark

Conceito: loop de velocidade — sinal de infinito (∞) comprimido horizontalmente, levemente inclinado para a direita (+5°). O ponto de interseção mais fino. As extremidades se abrem.

```svg
<!-- Placeholder SVG para implementação — substitua pelo logo final -->
<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="velox-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#2D1B6B"/>
      <stop offset="50%" stop-color="#6B4FE8"/>
      <stop offset="100%" stop-color="#1AD3C5"/>
    </linearGradient>
  </defs>
  <!-- Loop mark — implementar SVG final aqui -->
  <path d="M6 16C6 12 9 9 13 9C17 9 19 13 16 16C13 19 15 23 19 23C23 23 26 20 26 16"
        stroke="url(#velox-grad)" stroke-width="2.5" stroke-linecap="round" fill="none"/>
</svg>
```

### 6.3 Variantes

| Variante | Uso |
|---|---|
| Wordmark completo "velox" | Header, landing page |
| Ícone apenas | Favicon, mobile nav, avatar |
| Lockup horizontal (ícone + wordmark) | Sidebar, app header |

---

## 7. PÁGINA DE LANDING — estrutura de copy (above the fold)

```
H1:  Run growth.
     Not chaos.

H2:  O único OS construído para times de growth —
     da ideia ao insight, em um sistema.

Sub: Priorize com ICE/RICE. Rastreie seu funil.
     Capture learnings. Meça sua velocidade.
     Tudo conectado.

CTA primário:   [Começar grátis →]
CTA secundário: [Ver como funciona]
```

---

## 8. INSTRUÇÕES DE IMPLEMENTAÇÃO PARA O CLAUDE CODE

Execute na seguinte ordem:

### Passo 1 — Design Tokens
Crie `/src/styles/tokens.css` (ou equivalente no projeto) com todas as CSS custom properties da seção 2.

### Passo 2 — Tipografia
Adicione as fontes Google Fonts ao `index.html` ou `_document.tsx`. Configure as font stacks como variáveis CSS.

### Passo 3 — Tema Global
Atualize o arquivo de estilos globais com as variáveis de dark/light mode da seção 4.5. O dark mode deve ser o modo padrão visual da marca.

### Passo 4 — Componentes
Implemente os componentes da seção 4 (ScoreBadge, ResultBadge, KPI Card, Button) usando as cores e fontes definidas.

### Passo 5 — Copy
Substitua os textos genéricos do dashboard pelos copies da seção 5, incluindo empty states.

### Passo 6 — Consistência
Verifique que todo elemento numérico (scores, métricas, percentuais) usa `font-data` (JetBrains Mono) e a cor `--velox-pulse`.

---

## 9. REFERÊNCIAS DE MARCA

| Elemento | Valor |
|---|---|
| Domínio recomendado | velox.io / velox.app |
| Handle social | @veloxhq |
| Cor primária para favicon | #6B4FE8 |
| Cor de tema do browser (meta theme-color) | #0F0E1A |
| Open Graph background | #0F0E1A com wordmark centralizado |

---

*Documento gerado pelo Brand Squad — Brand Chief + Al Ries + Naming Strategist + Alina Wheeler + Donald Miller + Archetype Consultant*
*Stack: TSX + Velox Brand Identity v1.0*