'use client';

import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, ChevronRight, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { getExperiments, createExperiment, updateExperiment, updateExperimentStatus, ExperimentFormValues } from './actions';
import { getScoreMethod } from '@/lib/scoring';

// ─── Types ───────────────────────────────────────────────────────────────────

type Owner = { id: string; name: string | null };

type Experiment = {
    id: string;
    title: string;
    description: string | null;
    hypothesis: string | null;
    funnelStage: string;
    status: string;
    priorityScore: number | null;
    iceImpact: number | null;
    iceConfidence: number | null;
    iceEase: number | null;
    riceReach: number | null;
    riceImpact: number | null;
    riceConfidence: number | null;
    riceEffort: number | null;
    ownerId: string | null;
    owner: Owner | null;
    tags: string[];
    relatedMetric: string | null;
    expectedLift: number | null;
    actualLift: number | null;
    result: string | null;
    learning: string | null;
    startedAt: Date | null;
    endedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
};

// ─── Constants ───────────────────────────────────────────────────────────────

const COLUMNS: { id: string; label: string }[] = [
    { id: 'idea', label: 'Ideias' },
    { id: 'backlog', label: 'Backlog' },
    { id: 'in_progress', label: 'Em Execução' },
    { id: 'completed', label: 'Concluído' },
    { id: 'archived', label: 'Arquivado' },
];

const STATUS_NEXT: Record<string, string | null> = {
    idea: 'backlog',
    backlog: 'in_progress',
    in_progress: 'completed',
    completed: null,
    archived: null,
    paused: 'in_progress',
};

const STAGE_LABELS: Record<string, string> = {
    awareness: 'Awareness',
    acquisition: 'Acquisition',
    activation: 'Activation',
    retention: 'Retention',
    revenue: 'Revenue',
    referral: 'Referral',
};

const STAGE_COLORS: Record<string, string> = {
    awareness: 'bg-purple-100 text-purple-700',
    acquisition: 'bg-blue-100 text-blue-700',
    activation: 'bg-green-100 text-green-700',
    retention: 'bg-yellow-100 text-yellow-700',
    revenue: 'bg-emerald-100 text-emerald-700',
    referral: 'bg-pink-100 text-pink-700',
};

const RESULT_COLORS: Record<string, string> = {
    win: 'bg-green-100 text-green-700',
    loss: 'bg-red-100 text-red-700',
    inconclusive: 'bg-gray-100 text-gray-600',
};

// ─── Zod schema (mirrors server schema) ──────────────────────────────────────

const formSchema = z.object({
    title: z.string().min(1, 'Título obrigatório'),
    description: z.string().optional().nullable(),
    hypothesis: z.string().optional().nullable(),
    funnelStage: z.enum(['awareness', 'acquisition', 'activation', 'retention', 'revenue', 'referral']),
    status: z.enum(['idea', 'backlog', 'in_progress', 'paused', 'completed', 'archived']).default('idea'),
    iceImpact: z.coerce.number().min(1).max(10).optional().nullable(),
    iceConfidence: z.coerce.number().min(1).max(10).optional().nullable(),
    iceEase: z.coerce.number().min(1).max(10).optional().nullable(),
    riceReach: z.coerce.number().min(0).optional().nullable(),
    riceImpact: z.coerce.number().min(1).max(3).optional().nullable(),
    riceConfidence: z.coerce.number().min(0).max(100).optional().nullable(),
    riceEffort: z.coerce.number().min(0.1).optional().nullable(),
    ownerId: z.string().optional().nullable(),
    tags: z.string().default(''),
    relatedMetric: z.string().optional().nullable(),
    expectedLift: z.coerce.number().optional().nullable(),
    actualLift: z.coerce.number().optional().nullable(),
    result: z.enum(['win', 'loss', 'inconclusive']).optional().nullable(),
    learning: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

const DEFAULT_VALUES: FormValues = {
    title: '',
    description: '',
    hypothesis: '',
    funnelStage: 'acquisition',
    status: 'idea',
    iceImpact: null,
    iceConfidence: null,
    iceEase: null,
    riceReach: null,
    riceImpact: null,
    riceConfidence: null,
    riceEffort: null,
    ownerId: null,
    tags: '',
    relatedMetric: '',
    expectedLift: null,
    actualLift: null,
    result: null,
    learning: '',
};

function experimentToFormValues(e: Experiment): FormValues {
    return {
        title: e.title,
        description: e.description ?? '',
        hypothesis: e.hypothesis ?? '',
        funnelStage: e.funnelStage as FormValues['funnelStage'],
        status: e.status as FormValues['status'],
        iceImpact: e.iceImpact,
        iceConfidence: e.iceConfidence,
        iceEase: e.iceEase,
        riceReach: e.riceReach,
        riceImpact: e.riceImpact,
        riceConfidence: e.riceConfidence,
        riceEffort: e.riceEffort,
        ownerId: e.ownerId,
        tags: e.tags.join(', '),
        relatedMetric: e.relatedMetric ?? '',
        expectedLift: e.expectedLift,
        actualLift: e.actualLift,
        result: e.result as FormValues['result'] ?? null,
        learning: e.learning ?? '',
    };
}

// ─── Score Badge ─────────────────────────────────────────────────────────────

function ScoreBadge({ experiment }: { experiment: Experiment }) {
    const method = getScoreMethod(
        { iceImpact: experiment.iceImpact ?? undefined, iceConfidence: experiment.iceConfidence ?? undefined, iceEase: experiment.iceEase ?? undefined },
        { riceReach: experiment.riceReach ?? undefined, riceImpact: experiment.riceImpact ?? undefined, riceConfidence: experiment.riceConfidence ?? undefined, riceEffort: experiment.riceEffort ?? undefined },
    );
    const score = experiment.priorityScore;

    if (!method || score == null) return <span className="text-xs text-gray-400">— sem score</span>;

    const color = method === 'RICE' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700';
    return (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}>
            {method} {score.toFixed(1)}
        </span>
    );
}

// ─── Experiment Card ─────────────────────────────────────────────────────────

function ExperimentCard({ experiment, onEdit, onStatusChange }: {
    experiment: Experiment;
    onEdit: (e: Experiment) => void;
    onStatusChange: (id: string, status: string) => void;
}) {
    const nextStatus = STATUS_NEXT[experiment.status];
    const isPaused = experiment.status === 'paused';

    return (
        <Card className={`mb-3 shadow-sm hover:shadow-md transition-shadow ${isPaused ? 'border-l-4 border-l-yellow-400' : ''}`}>
            <CardHeader className="pb-2 pt-3 px-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                    <ScoreBadge experiment={experiment} />
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STAGE_COLORS[experiment.funnelStage] ?? 'bg-gray-100 text-gray-600'}`}>
                        {STAGE_LABELS[experiment.funnelStage] ?? experiment.funnelStage}
                    </span>
                </div>
            </CardHeader>
            <CardContent className="px-3 pb-3">
                <p className="font-medium text-sm leading-snug mb-2 line-clamp-2">{experiment.title}</p>

                <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                    <span>{experiment.owner?.name ?? 'Sem dono'}</span>
                    {experiment.result && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${RESULT_COLORS[experiment.result] ?? ''}`}>
                            {experiment.result}
                        </span>
                    )}
                </div>

                {experiment.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                        {experiment.tags.map(tag => (
                            <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                <div className="flex gap-2">
                    <Button size="xs" variant="ghost" onClick={() => onEdit(experiment)} className="h-6 px-2 text-xs">
                        <Pencil className="w-3 h-3" />
                    </Button>
                    {nextStatus && (
                        <Button
                            size="xs"
                            variant="outline"
                            onClick={() => onStatusChange(experiment.id, nextStatus)}
                            className="h-6 px-2 text-xs flex items-center gap-1"
                        >
                            Mover <ChevronRight className="w-3 h-3" />
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

// ─── Main View ───────────────────────────────────────────────────────────────

export default function ExperimentsView({ initialExperiments, users }: {
    initialExperiments: Experiment[];
    users: Owner[];
}) {
    const [experiments, setExperiments] = useState<Experiment[]>(initialExperiments);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingExperiment, setEditingExperiment] = useState<Experiment | null>(null);
    const [filterStage, setFilterStage] = useState('all');
    const [filterOwner, setFilterOwner] = useState('all');
    const [saving, setSaving] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: DEFAULT_VALUES,
    });

    useEffect(() => {
        if (isDialogOpen) {
            form.reset(editingExperiment ? experimentToFormValues(editingExperiment) : DEFAULT_VALUES);
        }
    }, [isDialogOpen, editingExperiment]);

    const filtered = useMemo(() => {
        return experiments.filter(e => {
            if (filterStage !== 'all' && e.funnelStage !== filterStage) return false;
            if (filterOwner !== 'all' && e.ownerId !== filterOwner) return false;
            return true;
        });
    }, [experiments, filterStage, filterOwner]);

    async function refresh() {
        const data = await getExperiments();
        setExperiments(data as unknown as Experiment[]);
    }

    async function onSubmit(values: FormValues) {
        setSaving(true);
        try {
            const payload: ExperimentFormValues = {
                ...values,
                tags: values.tags ? values.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
                description: values.description || null,
                hypothesis: values.hypothesis || null,
                relatedMetric: values.relatedMetric || null,
                learning: values.learning || null,
                ownerId: values.ownerId || null,
                result: values.result ?? null,
            };

            if (editingExperiment) {
                await updateExperiment(editingExperiment.id, payload);
            } else {
                await createExperiment(payload);
            }

            setIsDialogOpen(false);
            setEditingExperiment(null);
            await refresh();
        } finally {
            setSaving(false);
        }
    }

    async function handleStatusChange(id: string, status: string) {
        await updateExperimentStatus(id, status);
        await refresh();
    }

    function openCreate() {
        setEditingExperiment(null);
        setIsDialogOpen(true);
    }

    function openEdit(e: Experiment) {
        setEditingExperiment(e);
        setIsDialogOpen(true);
    }

    return (
        <div>
            {/* Filters bar */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
                <Select value={filterStage} onValueChange={setFilterStage}>
                    <SelectTrigger className="w-44">
                        <SelectValue placeholder="Etapa do funil" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas as etapas</SelectItem>
                        {Object.entries(STAGE_LABELS).map(([v, l]) => (
                            <SelectItem key={v} value={v}>{l}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={filterOwner} onValueChange={setFilterOwner}>
                    <SelectTrigger className="w-44">
                        <SelectValue placeholder="Responsável" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {users.map(u => (
                            <SelectItem key={u.id} value={u.id}>{u.name ?? u.id}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <div className="ml-auto">
                    <Button onClick={openCreate} className="flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Novo experimento
                    </Button>
                </div>
            </div>

            {/* Kanban board */}
            <div className="grid grid-cols-5 gap-4 min-h-[400px]">
                {COLUMNS.map(col => {
                    const cards = filtered
                        .filter(e => e.status === col.id || (col.id === 'in_progress' && e.status === 'paused'))
                        .sort((a, b) => (b.priorityScore ?? 0) - (a.priorityScore ?? 0));

                    return (
                        <div key={col.id} className="bg-gray-50 rounded-xl p-3 min-h-[300px]">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-sm text-gray-700">{col.label}</h3>
                                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{cards.length}</span>
                            </div>
                            {cards.map(e => (
                                <ExperimentCard
                                    key={e.id}
                                    experiment={e}
                                    onEdit={openEdit}
                                    onStatusChange={handleStatusChange}
                                />
                            ))}
                        </div>
                    );
                })}
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingExperiment ? 'Editar experimento' : 'Novo experimento'}</DialogTitle>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <Tabs defaultValue="basic">
                                <TabsList className="w-full">
                                    <TabsTrigger value="basic" className="flex-1">Informações</TabsTrigger>
                                    <TabsTrigger value="ice" className="flex-1">ICE Score</TabsTrigger>
                                    <TabsTrigger value="rice" className="flex-1">RICE Score</TabsTrigger>
                                    <TabsTrigger value="results" className="flex-1">Resultados</TabsTrigger>
                                </TabsList>

                                {/* Tab: Basic Info */}
                                <TabsContent value="basic" className="space-y-4 pt-4">
                                    <FormField control={form.control} name="title" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Título *</FormLabel>
                                            <FormControl><Input {...field} placeholder="Ex: Reescrever headline da landing page" /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />

                                    <FormField control={form.control} name="hypothesis" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Hipótese</FormLabel>
                                            <FormControl><Textarea {...field} value={field.value ?? ''} placeholder="Acreditamos que... para... porque..." rows={3} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />

                                    <FormField control={form.control} name="description" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Descrição</FormLabel>
                                            <FormControl><Textarea {...field} value={field.value ?? ''} placeholder="Detalhes adicionais..." rows={2} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField control={form.control} name="funnelStage" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Etapa do funil</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        {Object.entries(STAGE_LABELS).map(([v, l]) => (
                                                            <SelectItem key={v} value={v}>{l}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="status" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Status</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        {['idea', 'backlog', 'in_progress', 'paused', 'completed', 'archived'].map(s => (
                                                            <SelectItem key={s} value={s}>{s}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField control={form.control} name="ownerId" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Responsável</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value ?? ''}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="">Sem responsável</SelectItem>
                                                        {users.map(u => (
                                                            <SelectItem key={u.id} value={u.id}>{u.name ?? u.id}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="tags" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tags (separadas por vírgula)</FormLabel>
                                                <FormControl><Input {...field} placeholder="copy, landing, mobile" /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField control={form.control} name="relatedMetric" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Métrica relacionada</FormLabel>
                                                <FormControl><Input {...field} value={field.value ?? ''} placeholder="signup_rate" /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="expectedLift" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Lift esperado (%)</FormLabel>
                                                <FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? null : Number(e.target.value))} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                </TabsContent>

                                {/* Tab: ICE Score */}
                                <TabsContent value="ice" className="space-y-4 pt-4">
                                    <p className="text-sm text-gray-500">ICE Score = (Impact + Confidence + Ease) / 3</p>
                                    <div className="grid grid-cols-3 gap-4">
                                        {(['iceImpact', 'iceConfidence', 'iceEase'] as const).map((f, i) => (
                                            <FormField key={f} control={form.control} name={f} render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{['Impact', 'Confidence', 'Ease'][i]} (1-10)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min={1} max={10}
                                                            {...field}
                                                            value={field.value ?? ''}
                                                            onChange={e => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        ))}
                                    </div>
                                </TabsContent>

                                {/* Tab: RICE Score */}
                                <TabsContent value="rice" className="space-y-4 pt-4">
                                    <p className="text-sm text-gray-500">RICE Score = (Reach × Impact × Confidence%) / Effort. Se preenchido, substitui o ICE.</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField control={form.control} name="riceReach" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Reach (pessoas/semana)</FormLabel>
                                                <FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? null : Number(e.target.value))} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="riceImpact" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Impact (1-3)</FormLabel>
                                                <FormControl><Input type="number" min={1} max={3} {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? null : Number(e.target.value))} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="riceConfidence" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Confidence (0-100%)</FormLabel>
                                                <FormControl><Input type="number" min={0} max={100} {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? null : Number(e.target.value))} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="riceEffort" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Effort (semanas)</FormLabel>
                                                <FormControl><Input type="number" min={0.1} step={0.5} {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? null : Number(e.target.value))} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                </TabsContent>

                                {/* Tab: Results */}
                                <TabsContent value="results" className="space-y-4 pt-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField control={form.control} name="result" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Resultado</FormLabel>
                                                <Select onValueChange={v => field.onChange(v === 'none' ? null : v)} value={field.value ?? 'none'}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="none">Sem resultado</SelectItem>
                                                        <SelectItem value="win">Win 🏆</SelectItem>
                                                        <SelectItem value="loss">Loss</SelectItem>
                                                        <SelectItem value="inconclusive">Inconclusivo</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="actualLift" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Lift real (%)</FormLabel>
                                                <FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? null : Number(e.target.value))} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                    <FormField control={form.control} name="learning" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Aprendizado</FormLabel>
                                            <FormControl><Textarea {...field} value={field.value ?? ''} placeholder="O que aprendemos com este experimento?" rows={4} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </TabsContent>
                            </Tabs>

                            <DialogFooter className="mt-4">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={saving}>
                                    {saving ? 'Salvando...' : editingExperiment ? 'Salvar' : 'Criar'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
