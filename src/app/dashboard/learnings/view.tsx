'use client';

import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pin, PinOff, Pencil, Trash2, Plus, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

import { getLearnings, createLearning, updateLearning, deleteLearning, togglePin, LearningFormValues } from './actions';

// ─── Types ───────────────────────────────────────────────────────────────────

type Learning = {
    id: string;
    title: string;
    summary: string;
    category: string;
    funnelStage: string | null;
    impactLevel: string;
    resultType: string;
    evidence: string | null;
    recommendation: string | null;
    tags: string[];
    isPinned: boolean;
    experimentId: string | null;
    experiment: { id: string; title: string } | null;
    createdBy: { id: string; name: string | null } | null;
    createdAt: Date;
};

type ExperimentOption = { id: string; title: string };

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
    copy: 'Copy', ux: 'UX', pricing: 'Precificação', onboarding: 'Onboarding',
    activation: 'Ativação', retention: 'Retenção', channel: 'Canal', other: 'Outro',
};

const CATEGORY_COLORS: Record<string, string> = {
    copy: 'bg-violet-100 text-violet-700',
    ux: 'bg-blue-100 text-blue-700',
    pricing: 'bg-emerald-100 text-emerald-700',
    onboarding: 'bg-cyan-100 text-cyan-700',
    activation: 'bg-green-100 text-green-700',
    retention: 'bg-yellow-100 text-yellow-700',
    channel: 'bg-orange-100 text-orange-700',
    other: 'bg-gray-100 text-gray-600',
};

const IMPACT_COLORS: Record<string, string> = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-blue-100 text-blue-700',
};

const RESULT_COLORS: Record<string, string> = {
    validated: 'bg-green-100 text-green-700',
    invalidated: 'bg-red-100 text-red-700',
    inconclusive: 'bg-gray-100 text-gray-600',
};

const STAGE_OPTIONS: [string, string][] = [
    ['awareness', 'Reconhecimento'],
    ['acquisition', 'Aquisição'],
    ['activation', 'Ativação'],
    ['retention', 'Retenção'],
    ['revenue', 'Receita'],
    ['referral', 'Indicação'],
];

// ─── Form schema ─────────────────────────────────────────────────────────────

const formSchema = z.object({
    title: z.string().min(1, 'Título obrigatório'),
    summary: z.string().min(1, 'Resumo obrigatório'),
    category: z.enum(['copy', 'ux', 'pricing', 'onboarding', 'activation', 'retention', 'channel', 'other']),
    funnelStage: z.string().optional().nullable(),
    impactLevel: z.enum(['high', 'medium', 'low']).default('medium'),
    resultType: z.enum(['validated', 'invalidated', 'inconclusive']),
    evidence: z.string().optional().nullable(),
    recommendation: z.string().optional().nullable(),
    tags: z.string().default(''),
    experimentId: z.string().optional().nullable(),
    isPinned: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

const DEFAULT_VALUES: FormValues = {
    title: '',
    summary: '',
    category: 'other',
    funnelStage: null,
    impactLevel: 'medium',
    resultType: 'inconclusive',
    evidence: '',
    recommendation: '',
    tags: '',
    experimentId: null,
    isPinned: false,
};

function learningToForm(l: Learning): FormValues {
    return {
        title: l.title,
        summary: l.summary,
        category: l.category as FormValues['category'],
        funnelStage: l.funnelStage,
        impactLevel: l.impactLevel as FormValues['impactLevel'],
        resultType: l.resultType as FormValues['resultType'],
        evidence: l.evidence ?? '',
        recommendation: l.recommendation ?? '',
        tags: l.tags.join(', '),
        experimentId: l.experimentId,
        isPinned: l.isPinned,
    };
}

// ─── Learning Card ────────────────────────────────────────────────────────────

function LearningCard({ learning, onEdit, onPin, onDelete }: {
    learning: Learning;
    onEdit: (l: Learning) => void;
    onPin: (id: string) => void;
    onDelete: (id: string) => void;
}) {
    return (
        <Card className={learning.isPinned ? 'border-l-4 border-l-yellow-400' : ''}>
            <CardHeader className="pb-2 pt-3 px-4">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap gap-1.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${RESULT_COLORS[learning.resultType] ?? 'bg-gray-100'}`}>
                            {{ validated: 'Validado', invalidated: 'Invalidado', inconclusive: 'Inconclusivo' }[learning.resultType] ?? learning.resultType}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${IMPACT_COLORS[learning.impactLevel] ?? 'bg-gray-100'}`}>
                            {{ high: 'Alto', medium: 'Médio', low: 'Baixo' }[learning.impactLevel] ?? learning.impactLevel} impacto
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORY_COLORS[learning.category] ?? 'bg-gray-100'}`}>
                            {CATEGORY_LABELS[learning.category] ?? learning.category}
                        </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                        <Button size="icon-xs" variant="ghost" onClick={() => onPin(learning.id)}>
                            {learning.isPinned ? <PinOff className="w-3 h-3 text-yellow-500" /> : <Pin className="w-3 h-3 text-gray-400" />}
                        </Button>
                        <Button size="icon-xs" variant="ghost" onClick={() => onEdit(learning)}>
                            <Pencil className="w-3 h-3 text-gray-400" />
                        </Button>
                        <Button size="icon-xs" variant="ghost" onClick={() => onDelete(learning.id)}>
                            <Trash2 className="w-3 h-3 text-red-400" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
                <p className="font-semibold text-sm mb-1">{learning.title}</p>
                <p className="text-sm text-gray-600 line-clamp-3 mb-3">{learning.summary}</p>

                <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                    {learning.funnelStage && (
                        <span className="bg-gray-100 px-2 py-0.5 rounded">{learning.funnelStage}</span>
                    )}
                    {learning.experiment && (
                        <span className="bg-gray-100 px-2 py-0.5 rounded">→ {learning.experiment.title}</span>
                    )}
                    {learning.tags.map(t => (
                        <span key={t} className="bg-gray-100 px-1.5 py-0.5 rounded">{t}</span>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

// ─── Main View ────────────────────────────────────────────────────────────────

export default function LearningsView({ initialLearnings, experiments }: {
    initialLearnings: Learning[];
    experiments: ExperimentOption[];
}) {
    const [learnings, setLearnings] = useState<Learning[]>(initialLearnings);
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterImpact, setFilterImpact] = useState('all');
    const [filterResult, setFilterResult] = useState('all');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingLearning, setEditingLearning] = useState<Learning | null>(null);
    const [saving, setSaving] = useState(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: DEFAULT_VALUES,
    });

    useEffect(() => {
        if (isDialogOpen) {
            form.reset(editingLearning ? learningToForm(editingLearning) : DEFAULT_VALUES);
        }
    }, [isDialogOpen, editingLearning]);

    const filtered = useMemo(() => {
        return learnings.filter(l => {
            if (filterCategory !== 'all' && l.category !== filterCategory) return false;
            if (filterImpact !== 'all' && l.impactLevel !== filterImpact) return false;
            if (filterResult !== 'all' && l.resultType !== filterResult) return false;
            if (search) {
                const q = search.toLowerCase();
                if (!l.title.toLowerCase().includes(q) && !l.summary.toLowerCase().includes(q)) return false;
            }
            return true;
        });
    }, [learnings, filterCategory, filterImpact, filterResult, search]);

    const pinned = filtered.filter(l => l.isPinned);
    const unpinned = filtered.filter(l => !l.isPinned);

    async function refresh() {
        const data = await getLearnings();
        setLearnings(data as unknown as Learning[]);
    }

    async function onSubmit(values: FormValues) {
        setSaving(true);
        try {
            const payload: LearningFormValues = {
                ...values,
                tags: values.tags ? values.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
                funnelStage: values.funnelStage || null,
                evidence: values.evidence || null,
                recommendation: values.recommendation || null,
                experimentId: values.experimentId || null,
            };

            if (editingLearning) {
                await updateLearning(editingLearning.id, payload);
            } else {
                await createLearning(payload);
            }

            setIsDialogOpen(false);
            setEditingLearning(null);
            await refresh();
        } finally {
            setSaving(false);
        }
    }

    async function handlePin(id: string) {
        await togglePin(id);
        await refresh();
    }

    async function handleDelete(id: string) {
        await deleteLearning(id);
        await refresh();
    }

    function openCreate() {
        setEditingLearning(null);
        setIsDialogOpen(true);
    }

    function openEdit(l: Learning) {
        setEditingLearning(l);
        setIsDialogOpen(true);
    }

    return (
        <div>
            {/* Search + Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        className="pl-9"
                        placeholder="Buscar por título ou resumo..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas categorias</SelectItem>
                        {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
                            <SelectItem key={v} value={v}>{l}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={filterImpact} onValueChange={setFilterImpact}>
                    <SelectTrigger className="w-36">
                        <SelectValue placeholder="Impacto" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todo impacto</SelectItem>
                        <SelectItem value="high">Alto</SelectItem>
                        <SelectItem value="medium">Médio</SelectItem>
                        <SelectItem value="low">Baixo</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={filterResult} onValueChange={setFilterResult}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Resultado" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos resultados</SelectItem>
                        <SelectItem value="validated">Validado</SelectItem>
                        <SelectItem value="invalidated">Invalidado</SelectItem>
                        <SelectItem value="inconclusive">Inconclusivo</SelectItem>
                    </SelectContent>
                </Select>

                <Button onClick={openCreate} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Novo aprendizado
                </Button>
            </div>

            {/* Count */}
            <p className="text-sm text-gray-500 mb-4">{filtered.length} aprendizado{filtered.length !== 1 ? 's' : ''}</p>

            {/* Pinned section */}
            {pinned.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-xs font-semibold text-yellow-600 uppercase tracking-wide mb-3 flex items-center gap-1">
                        <Pin className="w-3 h-3" /> Fixados
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {pinned.map(l => (
                            <LearningCard key={l.id} learning={l} onEdit={openEdit} onPin={handlePin} onDelete={handleDelete} />
                        ))}
                    </div>
                </div>
            )}

            {/* Unpinned */}
            {unpinned.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {unpinned.map(l => (
                        <LearningCard key={l.id} learning={l} onEdit={openEdit} onPin={handlePin} onDelete={handleDelete} />
                    ))}
                </div>
            )}

            {filtered.length === 0 && (
                <div className="text-center py-16" style={{ color: 'var(--velox-mist)' }}>
                    {learnings.length === 0
                        ? (
                            <div>
                                <p className="velox-heading text-base mb-1">Seus aprendizados vivem aqui.</p>
                                <p className="text-sm">Cada experimento concluído gera um aprendizado. Comece pelo backlog.</p>
                            </div>
                        )
                        : 'Nenhum resultado para os filtros aplicados.'}
                </div>
            )}

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingLearning ? 'Editar aprendizado' : 'Novo aprendizado'}</DialogTitle>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <Tabs defaultValue="details">
                                <TabsList className="w-full">
                                    <TabsTrigger value="details" className="flex-1">Detalhes</TabsTrigger>
                                    <TabsTrigger value="evidence" className="flex-1">Evidência & Recomendação</TabsTrigger>
                                </TabsList>

                                <TabsContent value="details" className="space-y-4 pt-4">
                                    <FormField control={form.control} name="title" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Título *</FormLabel>
                                            <FormControl><Input {...field} placeholder="Ex: Copy direto converte mais que copy inteligente" /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />

                                    <FormField control={form.control} name="summary" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Resumo *</FormLabel>
                                            <FormControl><Textarea {...field} placeholder="O que foi descoberto e qual o impacto..." rows={3} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField control={form.control} name="category" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Categoria</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
                                                            <SelectItem key={v} value={v}>{l}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="resultType" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Resultado</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="validated">Validado ✅</SelectItem>
                                                        <SelectItem value="invalidated">Invalidado ❌</SelectItem>
                                                        <SelectItem value="inconclusive">Inconclusivo</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="impactLevel" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nível de impacto</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="high">Alto</SelectItem>
                                                        <SelectItem value="medium">Médio</SelectItem>
                                                        <SelectItem value="low">Baixo</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="funnelStage" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Etapa do funil</FormLabel>
                                                <Select onValueChange={v => field.onChange(v === 'none' ? null : v)} value={field.value ?? 'none'}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="none">Nenhuma</SelectItem>
                                                        {STAGE_OPTIONS.map(([value, label]) => (
                                                            <SelectItem key={value} value={value}>{label}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField control={form.control} name="experimentId" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Experimento relacionado</FormLabel>
                                                <Select onValueChange={v => field.onChange(v === 'none' ? null : v)} value={field.value ?? 'none'}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="none">Nenhum</SelectItem>
                                                        {experiments.map(e => (
                                                            <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="tags" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tags (separadas por vírgula)</FormLabel>
                                                <FormControl><Input {...field} placeholder="mobile, cta, preço" /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                </TabsContent>

                                <TabsContent value="evidence" className="space-y-4 pt-4">
                                    <FormField control={form.control} name="evidence" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Evidência</FormLabel>
                                            <FormControl><Textarea {...field} value={field.value ?? ''} placeholder="Dados, métricas, observações que suportam este aprendizado..." rows={4} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />

                                    <FormField control={form.control} name="recommendation" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Recomendação</FormLabel>
                                            <FormControl><Textarea {...field} value={field.value ?? ''} placeholder="O que fazer com este aprendizado? Próximos passos..." rows={4} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </TabsContent>
                            </Tabs>

                            <DialogFooter className="mt-4">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                                <Button type="submit" disabled={saving}>
                                    {saving ? 'Salvando...' : editingLearning ? 'Salvar' : 'Criar'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
