import fs from 'fs';
import path from 'path';
import { invokeSkill } from '@/lib/skills/runner';
import { MODELS } from '@/lib/openrouter';

const DESIGN_PATH = path.join(process.cwd(), 'DESIGN.md');
const LEGACY_PATH = path.join(process.cwd(), 'DESIGN.legacy-coinbase.md');
const BRAND_PATH = path.join(process.cwd(), 'BRAND.md');

const aiFeelDiagnosis = `Diagnóstico de "cara de IA genérica" encontrado no produto atual (screens reais, não hipótese):
- O mesmo recipe de card (\`rounded-xl border border-[var(--border)] bg-[var(--card)] p-6\`) é reimplementado à mão em 8+ lugares diferentes, sem nenhum componente compartilhado.
- DESIGN.md define uma escala de tipografia completa, mas nenhuma fonte real é carregada via next/font — o app inteiro cai no fallback do sistema. A fonte nunca foi implementada.
- O "logo" é um ícone genérico Sparkles dentro de uma caixa colorida — não é uma marca, é um placeholder de biblioteca de ícones.
- Os 3 tiles de KPI do dashboard principal são idênticos entre si: eyebrow em uppercase com tracking largo → número gigante → caption pequena → barrinha de progresso, repetidos 3x sem nenhuma hierarquia visual entre eles.
- O card de resumo executivo — que deveria ser o momento central do produto, a "resposta" que o usuário busca — hoje é tratado como um simples callout com tint de cor, do mesmo jeito que qualquer aviso genérico.
- O stepper de onboarding é o padrão círculo-numerado-com-linha-fina mais genérico possível, sem nenhuma personalidade.
- O chat é visualmente uma cópia 1:1 do padrão de bolhas do ChatGPT.
- Os 4 tipos de card de insight no MessageRenderer (module_unlock, insight, research_progress, action_request) compartilham exatamente o mesmo template visual, diferenciados só pela troca de matiz de cor (bg-{cor}/10 border-{cor}/30) — nenhuma diferenciação real de layout, peso ou hierarquia entre um desbloqueio de módulo e uma solicitação de ação.
- Bug real de token quebrado: MaturityGapList.tsx usa cores Tailwind hardcoded (border-red-400, bg-red-500, border-green-400, bg-green-500) em vez de tokens semânticos — o único lugar onde o sistema de tokens atual realmente quebra.`;

const task = `Você é @design-system-architect do design-squad, com apoio de @brad-frost para a estrutura de design atômico. O DESIGN.md atual não tem nenhuma relação com a marca da Flywell — é literalmente um documento de análise de marca da Coinbase (concorrente de outra categoria, uma exchange de cripto) com uma única frase colada dizendo "Applied to Flywell GrowthOS". Rode *audit-design contra esse DESIGN.md atual (fornecido em Data > currentDesignSystem) apontando explicitamente esse problema, e então rode *create-design-system para substituí-lo por completo — não estenda o sistema herdado da Coinbase, comece do zero a partir da marca real da Flywell (fornecida em Data > brand).

Use o diagnóstico de "cara de IA genérica" abaixo (Additional Context) como a lista de problemas reais que o novo sistema precisa resolver.

Estruture a resposta em português, em markdown, com exatamente estas seções:

## Cores
Tokens de cor finais. Responda explicitamente: manter #0052ff (já em produção, zero custo de migração) ou evoluir para outra cor primária — justifique com base no posicionamento/arquétipo da marca (Sábio + Criador, sóbrio, baseado em dados). Inclua tokens semânticos de success/danger/warning (hoje inexistentes — o produto usa cores Tailwind hardcoded nesses casos).

## Tipografia
Um par de fontes display + body, disponível via next/font/google (não retorne uma fonte que exija licença). Instrução explícita: não recomende Inter — Inter como substituto é, ele mesmo, um dos sinais de "cara de IA genérica" já identificados nesta auditoria. Justifique a escolha com base na marca real (arquétipo Sábio+Criador, tom sóbrio e institucional).

## Espaçamento e raio de borda
Escala de spacing e de border-radius.

## Componentes
Specs concretos (cor, tipografia, padding, estado hover, etc.) para: botão, card, badge, input, stepper, bolha de chat, e a família de "insight card" — este último precisa cobrir os 4 tipos (module_unlock, insight, research_progress, action_request) com diferenciação visual real entre eles (não só troca de matiz de cor).

## Restrições visuais
Reafirme sem dark mode, sem gradiente, sem sombra decorativa (exceto possivelmente em hover) — mas re-derive a razão dessa restrição a partir da marca real da Flywell (sobriedade, credibilidade analítica, arquétipo Sábio), não copie a justificativa antiga que vinha da Coinbase.`;

async function main() {
  if (!fs.existsSync(BRAND_PATH)) {
    console.error('[generate-design-system] BRAND.md não encontrado. Rode "npm run generate:brand" primeiro.');
    process.exit(1);
  }

  const brand = fs.readFileSync(BRAND_PATH, 'utf-8');
  const currentDesignSystem = fs.readFileSync(DESIGN_PATH, 'utf-8');

  const ctx = {
    workspaceId: 'flywell-self',
  };

  console.error('[generate-design-system] chamando design-squad (pode levar de segundos a alguns minutos no free tier)...');

  const result = await invokeSkill(
    'design-squad',
    {
      task,
      context: aiFeelDiagnosis,
      data: { brand, currentDesignSystem },
    },
    ctx,
    MODELS.advanced
  );

  if (!result.ok) {
    console.error('[generate-design-system] falhou:', result.reason);
    process.exit(1);
  }

  fs.copyFileSync(DESIGN_PATH, LEGACY_PATH);
  console.error(`[generate-design-system] DESIGN.md antigo preservado em ${LEGACY_PATH}`);

  const header = `---
generatedAt: ${new Date().toISOString()}
model: ${result.model}
skill: design-squad
supersedes: DESIGN.legacy-coinbase.md
---

`;

  fs.writeFileSync(DESIGN_PATH, header + result.content, 'utf-8');
  console.error(`[generate-design-system] escrito em ${DESIGN_PATH}`);
  console.log(result.content);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[generate-design-system] failed:', err);
    process.exit(1);
  });
