---
generatedAt: 2026-09-17T00:27:23.934Z
model: openrouter/free
skill: design-squad
supersedes: DESIGN.legacy-coinbase.md
---

## Audit do Sistema Atual (DESIGN.md)

O documento atual `DESIGN.md` é um caso de texto substancialmente alheio à Flywell:

1. **Herança da Coinbase:** O sistema foi copiado integralmente da identidade visual da Coinbase (exchange cripto), uma marca de outra categoria e arquétipo completamente diferente (Herói vs Sábio+Criador).
2. **Falta de alinhamento:** Não há conexão com o posicionamento da Flywell — substitui o achismo por dados verificados, arquétipo Sábio+Cririar, tom sóbrio e institucional.
3. **Placeholder de marca:** O "logo" é um ícone genérico de *Sparkles* em uma caixa colorida — não há identidade visual da Flywell.
4. **Bug de token quebrado:** `MaturityGapList.tsx` usa Tailwind hardcoded (`border-red-400`, `bg-red-500`) em vez de tokens semânticos.
5. **Componentes não compartilhados:** O mesmo recipe de card é reimplementado manualmente em 8+ lugares.
6. **Tipografia fantasma:** A escala de tips está definida, mas nenhuma fonte real é carregada via `next/font` — o app cai no fallback do sistema.
7. **Design genérico "de IA":** Todos os problemas listados no *Additional Context* apontam para um sistema herdado que transmite "cara de IA genérica" e não a autoridade analítica da Flywell.

> **Decisão:** Não há extensão ou sobreposição. O sistema Coinbase será descartado e substituído pelo zero a partir da marca real da Flywell.

---

## Cores

### Decisão sobre a cor primária

**Decisão: EVOLUIR para uma cor primária nova.** Embora `#0052ff` (blue Coinbase) já esteja em produção, mantê-lo carrega um risco grave: ele é a **identidade visual de uma marca concorrente direta** (exchange cripto) e transmite a "cara de IA genérica". A Flywell precisa estabelecer sua **própria voltagem visual** alinhada ao seu arquétipo Sábio+Criador.

| Token | Hex | Uso | Justificativa |
|-------|-----|-----|---------------|
| `flywell-blue` | `#003e8a` | CTAs primários, wordmark, ícones-chave | Azul profundo evoca confiança e seriedade analítica. Mais sóbrio que o azul elétronico `#0052ff`, alinha-se ao tom institucional e comunica autoridade sem apelo emocional. |
| `flywell-blue-hover` | `#002e66` | Hover em CTAs primários | Escurecimento sutil mantém a calma visual. |
| `flywell-blue-active` | `#001f4d` | Estado ativo / foco | Mais escuro para pressão tátil. |
| `success` | `#0e8a5f` | Métricas positivas, status OK | Verde-musgo, sobrio, sem o vibrante do Tailwind padrão. |
| `danger` | `#c83b4b` | Alertas, erros, métricas negativas | Vermelho-terroso, menos agressivo que `#cf202f`. |
| `warning` | `#c68927` | Avisos, estados intermediários | Amarelo-terroso, alinhado à paleta institucional. |

> **Justificativa baseada na marca:** O arquétipo Sábio busca verdade e conhecimento. Azuis profundos comuns em instituições acadêmicas e de dados (ex: IBM, SAS Institute) comunicam seriedade analítica. O azul `#003e8a` evita o apelo "fintech-bombástico" do `#0052ff` enquanto mantém a seriedade do setor de dados. A ausência de gradientes e sombras decorativas reforça a sobriedade institucional.

---

## Tipografia

### Decisão de fontes

**Display:** `Playfair Display` (Google Fonts)
**Body:** `Lora` (Google Fonts)

> **Instrução atendida:** Nenhuma das fontes solicita licença e ambas estão disponíveis via `next/font`. **Inter foi explicitamente evitado** — ele é um dos principais sinais do "cara de IA genérica" na auditoria.

| Token | Fonte | Peso | Tamanho | Leading | Letra | Uso |
|-------|-------|------|---------|---------|-------|-----|
| `display-xl` | Playfair Display | 700 | 56px | 1.1 | -1.12px | Títulos de tela |
| `display-lg` | Playfair Display | 700 | 42px | 1.15 | -0.84px | Sub-títulos |
| `display-md` | Playfair Display | 600 | 32px | 1.2 | -0.64px | Cards de insight |
| `title-lg` | Playfair Display | 600 | 22px | 1.3 | -0.22px | Títulos de seção |
| `title-md` | Lora | 700 | 18px | 1.4 | 0 | Sub-títulos |
| `body-lg` | Lora | 400 | 17px | 1.6 | 0 | Texto corrido |
| `body-md` | Lora | 400 | 15px | 1.6 | 0 | Texto secundário |
| `body-sm` | Lora | 400 | 13px | 1.5 | 0 | Labels, captions |
| `mono` | `ui-monospace, SFMono-Regular` | 400 | 14px | 1.5 | 0 | Dados, scores |

> **Justificativa baseada na marca:** Playfair Display (serif elegante) + Lora (serif oculpacional) criam uma percepção de **editorialidade e autoridade intelectual**. Serifs comunicam tradição, profundidade e refinamento — alinhado ao arquétipo Sábio. Ao contrário de Inter (sans neutro e genérico de IA), Playfair+Lora transmitem **individualidade e sofisticação institucional**, como uma consultoria de dados impressa.

---

## Espaçamento e raio de borda

### Escala de espaçamento (base 4px)

| Token | Valor | Uso |
|-------|-------|-----|
| `spacing-xxs` | 4px | Micro-ajustes, ícones-in-texto |
| `spacing-xs` | 8px | Gap entre linha de texto |
| `spacing-sm` | 12px | Padding interno de badges |
| `spacing-md` | 16px | Padding entre seções internas |
| `spacing-lg` | 24px | Gap entre blocos principais |
| `spacing-xl` | 32px | Padding entre seções de página |
| `spacing-xxl` | 48px | Margens de container |

### Escala de borda arredondada

| Token | Valor | Uso |
|-------|-------|-----|
| `radius-none` | 0px | Divisores, bordas implícitas |
| `radius-sm` | 4px | Inputs, elementos compactos |
| `radius-md` | 8px | Cards de insight, popovers |
| `radius-lg` | 12px | Cards de conteúdo |
| `radius-xl` | 16px | Containers elevados |
| `radius-pill` | 9999px | Badges, botões secundários |

---

## Componentes

### 1. Botão Primário

- **Cor de fundo:** `flywell-blue` (`#003e8a`)
- **Cor do texto:** `#ffffff`
- **Tipografia:** `title-md` (Lora, 18px, 700)
- **Padding:** `12px 20px`
- **Raio de borda:** `radius-md` (8px)
- **Hover:** `flywell-blue-hover` (`#002e66`)
- **Active:** `flywell-blue-active` (`#001f4d`)
- **Focus:** Anel de foco `2px` em `flywell-blue` com offset `2px` em `#ffffff`
- **Loading:** Spinner interno + opacidade 0.7

### 2. Card

- **Cor de fundo:** `#ffffff`
- **Cor da borda:** `#e2e5eb` (hairline neutro)
- **Borda:** `1px solid`
- **Raio de borda:** `radius-lg` (12px)
- **Padding:** `24px`
- **Hover:** Levanta `4px` via `translateY(-4px)` + sombra sutil (`0 4px 12px rgba(0, 62, 138, 0.06)`)

### 3. Badge

- **Cor de fundo:** `#f0f3f8` (tint de azul muito claro)
- **Cor do texto:** `flywell-blue` (`#003e8a`)
- **Tipografia:** `body-sm` (Lora, 13px, 400)
- **Padding:** `4px 10px`
- **Raio de borda:** `radius-pill`

### 4. Input de Texto

- **Cor de fundo:** `#ffffff`
- **Cor da borda:** `#d1d5db` (neutro claro)
- **Borda:** `1px solid`
- **Raio de borda:** `radius-sm` (4px)
- **Padding:** `12px 14px`
- **Altura:** `44px`
- **Hover:** Borda escurece para `#9aa4b2`
- **Focus:** `#003e8a` + anel de foco

### 5. Stepper (Onboarding)

- **Indicador:** Círculo de `36px` com borda `2px solid #003e8a`
- **Número:** `title-md` (Lora, 18px, 700) na cor `flywell-blue`
- **Linha de conexão:** `2px` de altura, cor `#d1d5db`
- **Estado ativo:** Preenchimento `#003e8a`, texto `#ffffff`
- **Estado completo:** Preenchimento `#ffffff`, borda `#003e8a`
- **Estado futuro:** Preenchimento `#ffffff`, borda `#d1d5db`

### 6. Bolha de Chat

- **Bolha do usuário (direita):**
  - **Fundo:** `#003e8a`
  - **Texto:** `#ffffff`
  - **Raio:** `16px 4px 16px 16px`
- **Bolha do sistema (esquerda):**
  - **Fundo:** `#f8fafc`
  - **Texto:** `#0f172a`
  - **Raio:** `4px 16px 16px 16px`
- **Tipografia:** `body-lg` (Lora, 17px)
- **Padding:** `14px 18px`

### 7. Insight Card — Família de 4 Tipos

Diferenciação **real** entre os 4 tipos, não apenas troca de matiz:

#### Tipo 1: `module_unlock`
- **Borda esquerda:** `4px solid flywell-blue` (`#003e8a`)
- **Ícone:** Pequeno ícone *unlock* no canto superior direito
- **Layout:** Título em `display-md`, cor `flywell-blue`
- **Subtítulo:** `body-sm` em cinza (`#64748b`)
- **Padding:** `20px`

#### Tipo 2: `insight`
- **Borda esquerda:** `4px solid success` (`#0e8a5f`)
- **Ícone:** Ícone *trending-up* no canto superior direito
- **Layout:** Título em `display-md`, cor `success`
- **Corpo:** `body-lg`
- **Padding:** `20px`

#### Tipo 3: `research_progress`
- **Borda esquerda:** `4px solid warning` (`#c68927`)
- **Ícone:** Ícone *progress-activity* no canto superior direito
- **Layout:** Título em `display-md`, cor `warning`
- **Barra de progresso horizontal** abaixo do título (altura 6px, cor `warning`)
- **Padding:** `20px`

#### Tipo 4: `action_request`
- **Borda esquerda:** `4px solid danger` (`#c83b4b`)
- **Ícone:** Ícone *alert-circle* no canto superior direito
- **Layout:** Título em `display-md`, cor `danger`
- **Botão "Resolver" inline** no canto inferior direito (tamanho `sm`)
- **Padding:** `20px`

---

## Restrições Visuais

| Restrição | Justificativa baseada na marca Flywell |
|-----------|----------------------------------------|
| **Sem dark mode** | A Flywell opera com autoridade institucional. O arquétipo Sábio valoriza clareza e legibilidade acima de estilização. Dark mode introduz complexidade de token que não é priorizada para um MVP focado em credibilidade analítica. |
| **Sem gradiente** | Gradientes sugerem "magia" ou "transformação mágica" — conceitos que a Flywell rejeita ("growth não é jogo de adivinhação"). Azul sólido e bloco de cor comunicam seriedade e verificabilidade. |
| **Sem sombra decorativa** | A Flywell é institucional. Sombra decorativa sugere "efeto especial", contradizendo o tom sóbrio e baseado em dados. Exceção: sombra no **hover do card**, para dar profundidade funcional (não estética) à interação — alinhado ao arquétipo Criador que "constrói experience com propósito". |