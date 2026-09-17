import { Palette, BookOpen, Star, Mic, ExternalLink } from 'lucide-react';
import { resolveBrandContext } from '@/lib/mock/resolver';
import { getCurrentWorkspaceId } from '@/lib/workspace/current';
import { ResearchLensCard } from '@/components/branding/ResearchLensCard';

// Cor sólida por nível, opacidade decrescente para diferenciar as 6 camadas
// da pirâmide sem sair da paleta do design system (antes: hues Tailwind
// hardcoded — red/orange/yellow/blue/indigo/purple — que não existem no
// token set atual e quebravam contra a nova identidade visual).
const CBBE_SCORES = [
  { level: 'Brand Salience', description: 'Quem você é?', score: 2.5, color: 'bg-primary' },
  { level: 'Brand Performance', description: 'O que você faz?', score: 3.8, color: 'bg-primary/85' },
  { level: 'Brand Imagery', description: 'O que você representa?', score: 3.0, color: 'bg-primary/70' },
  { level: 'Brand Judgments', description: 'O que penso de você?', score: 3.5, color: 'bg-primary/55' },
  { level: 'Brand Feelings', description: 'O que sinto por você?', score: 2.8, color: 'bg-primary/40' },
  { level: 'Brand Resonance', description: 'Qual nossa conexão?', score: 2.2, color: 'bg-primary/30' },
];

export default async function BrandingPage() {
  const workspaceId = await getCurrentWorkspaceId();
  const brand = await resolveBrandContext(workspaceId) as Record<string, unknown>;

  const researchResults = brand.research_results as Record<string, unknown> | undefined;
  const lenses = researchResults?.lenses as
    | Record<string, { label: string; result: string | null; error?: string }>
    | undefined;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-xl bg-surface-strong flex items-center justify-center">
          <Palette size={18} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Branding</h1>
          <p className="text-sm text-muted-foreground">
            Identidade de marca gerada por brand-squad + storytelling + design-squad
          </p>
        </div>
        {brand.brandbook_url ? (
          <a href={brand.brandbook_url as string} target="_blank" rel="noreferrer"
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs hover:bg-muted transition-colors">
            <BookOpen size={12} />
            Ver Brandbook
            <ExternalLink size={10} />
          </a>
        ) : (
          <button className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs hover:opacity-90 transition-opacity">
            <BookOpen size={12} />
            Gerar Brandbook
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left column: Brand DNA */}
        <div className="col-span-2 space-y-5">

          {/* Brand Brief */}
          <div className="rounded-xl bg-card shadow-elevated p-5">
            <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
              <Star size={12} /> Brand DNA
            </h2>
            <p className="text-sm leading-relaxed">{brand.brief as string}</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Arquétipo</p>
                <p className="text-sm font-medium">{brand.archetype as string}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Tagline</p>
                <p className="text-sm font-medium italic">"{brand.tagline as string}"</p>
              </div>
            </div>
          </div>

          {/* Brand Voice */}
          <div className="rounded-xl bg-card shadow-elevated p-5">
            <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
              <Mic size={12} /> Brand Voice
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{brand.voice as string}</p>
          </div>

          {/* Brand Research Lenses */}
          {lenses && (
            <div className="rounded-xl bg-card shadow-elevated p-5">
              <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
                Diagnóstico de Inteligência de Marca
              </h2>
              <div className="space-y-4">
                {Object.values(lenses).map((lens) => (
                  <ResearchLensCard
                    key={lens.label}
                    label={lens.label}
                    result={lens.result}
                    error={lens.error}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4 border-t border-border pt-3">
                Pesquisa gerada a partir do seu diagnóstico de marca e mercado
              </p>
            </div>
          )}
        </div>

        {/* Right column: CBBE + Colors */}
        <div className="space-y-5">

          {/* CBBE Pyramid */}
          <div className="rounded-xl bg-card shadow-elevated p-5">
            <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
              Força de Marca
            </h2>
            <div className="space-y-2.5">
              {CBBE_SCORES.map((item) => (
                <div key={item.level}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium">{item.level}</span>
                    <span className="text-xs text-muted-foreground">{item.score}/5</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground mb-1">{item.description}</div>
                  <div className="h-1.5 rounded-full bg-surface-strong">
                    <div
                      className={`h-full rounded-full ${item.color} transition-all duration-700`}
                      style={{ width: `${(item.score / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-3">
              Modelo CBBE de força de marca
            </p>
          </div>

          {/* Colors — a fresh workspace has no brand_context row yet (empty
              object from getBrandContext), so colors can be undefined until
              brand research has run at least once. */}
          {((brand.colors as string[] | undefined)?.length ?? 0) > 0 && (
            <div className="rounded-xl bg-card shadow-elevated p-5">
              <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
                Paleta de Cores
              </h2>
              <div className="flex gap-2">
                {(brand.colors as string[]).map((color) => (
                  <div key={color} className="flex flex-col items-center gap-1.5">
                    <div
                      className="w-10 h-10 rounded-lg border border-border"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-[10px] text-muted-foreground">{color}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Brandbook CTA */}
          <div className="rounded-xl border border-border border-dashed bg-card p-5 text-center">
            <BookOpen size={24} className="mx-auto mb-2 text-muted-foreground" />
            <p className="text-xs text-muted-foreground mb-3">
              Manual de marca completo ainda não gerado
            </p>
            <button className="w-full py-2 rounded-lg bg-primary text-white text-xs font-medium hover:opacity-90 transition-opacity">
              Gerar com IA
            </button>
            <p className="text-[10px] text-muted-foreground mt-2">
              Gerado a partir do seu diagnóstico de marca
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
