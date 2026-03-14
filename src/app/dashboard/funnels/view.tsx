'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, ChevronRight, AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import {
    getFunnels, getFunnel, createFunnel, deleteFunnel,
    createSnapshot, FunnelFormValues, SnapshotFormValues,
} from './actions';

// ─── Types ───────────────────────────────────────────────────────────────────

type StageDef = { name: string; order: number; description?: string };
type SnapshotStage = { stageName: string; value: number; unit?: string };

type Snapshot = {
    id: string;
    snapshotDate: Date | string;
    stageData: SnapshotStage[];
    notes: string | null;
    createdBy: { id: string; name: string | null } | null;
};

type StageLink = {
    id: string;
    stageName: string;
    experiment: { id: string; title: string; status: string; funnelStage: string; priorityScore: number | null };
};

type FunnelSummary = {
    id: string;
    name: string;
    description: string | null;
    stages: StageDef[];
    _count: { snapshots: number };
};

type FunnelDetail = FunnelSummary & {
    snapshots: Snapshot[];
    stageLinks: StageLink[];
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function findBottleneck(stageData: SnapshotStage[]): string | null {
    if (stageData.length < 2) return null;
    let maxDrop = -1;
    let bottleneck: string | null = null;
    for (let i = 1; i < stageData.length; i++) {
        const prev = stageData[i - 1].value;
        const curr = stageData[i].value;
        if (prev > 0) {
            const drop = (prev - curr) / prev;
            if (drop > maxDrop) { maxDrop = drop; bottleneck = stageData[i].stageName; }
        }
    }
    return bottleneck;
}

function pct(from: number, to: number): string {
    if (from === 0) return '—';
    return ((to / from) * 100).toFixed(1) + '%';
}

function formatDate(d: Date | string): string {
    return new Date(d).toLocaleDateString('pt-BR');
}

// ─── Zod schemas ─────────────────────────────────────────────────────────────

const stageDefSchema = z.object({
    name: z.string().min(1, 'Obrigatório'),
    order: z.number(),
    description: z.string().optional(),
});

const funnelFormSchema = z.object({
    name: z.string().min(1, 'Nome obrigatório'),
    description: z.string().optional().nullable(),
    stages: z.array(stageDefSchema).min(1),
});

type FunnelForm = z.infer<typeof funnelFormSchema>;

// ─── Create Funnel Dialog ─────────────────────────────────────────────────────

function CreateFunnelDialog({ onCreated }: { onCreated: () => void }) {
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const form = useForm<FunnelForm>({
        resolver: zodResolver(funnelFormSchema) as any,
        defaultValues: { name: '', description: '', stages: [{ name: '', order: 0 }] },
    });

    const { fields, append, remove } = useFieldArray({ control: form.control, name: 'stages' });

    async function onSubmit(values: FunnelForm) {
        setSaving(true);
        try {
            const payload: FunnelFormValues = {
                ...values,
                stages: values.stages.map((s, i) => ({ ...s, order: i })),
            };
            await createFunnel(payload);
            setOpen(false);
            form.reset();
            onCreated();
        } finally {
            setSaving(false);
        }
    }

    return (
        <>
            <Button onClick={() => setOpen(true)} className="flex items-center gap-2">
                <Plus className="w-4 h-4" /> Novo funil
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Criar funil</DialogTitle></DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome *</FormLabel>
                                    <FormControl><Input {...field} placeholder="Funil de Ativação" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="description" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descrição</FormLabel>
                                    <FormControl><Textarea {...field} value={field.value ?? ''} rows={2} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <FormLabel>Etapas</FormLabel>
                                    <Button type="button" size="xs" variant="outline" onClick={() => append({ name: '', order: fields.length })}>
                                        + Adicionar
                                    </Button>
                                </div>
                                {fields.map((field, i) => (
                                    <div key={field.id} className="flex gap-2 mb-2 items-center">
                                        <span className="text-xs text-gray-400 w-5">{i + 1}.</span>
                                        <FormField control={form.control} name={`stages.${i}.name`} render={({ field }) => (
                                            <FormItem className="flex-1 mb-0">
                                                <FormControl><Input {...field} placeholder={`Etapa ${i + 1}`} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        {fields.length > 1 && (
                                            <Button type="button" size="icon-xs" variant="ghost" onClick={() => remove(i)}>
                                                <Trash2 className="w-3 h-3 text-red-400" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                                <Button type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Criar'}</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );
}

// ─── Add Snapshot Dialog ──────────────────────────────────────────────────────

function AddSnapshotDialog({ funnel, onAdded }: { funnel: FunnelDetail; onAdded: () => void }) {
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [values, setValues] = useState<Record<string, string>>({});
    const [notes, setNotes] = useState('');
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

    const stages = [...funnel.stages].sort((a, b) => a.order - b.order);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        try {
            const stageData = stages.map(s => ({
                stageName: s.name,
                value: Number(values[s.name] ?? 0),
            }));
            const payload: SnapshotFormValues = { snapshotDate: date, stageData, notes: notes || null };
            await createSnapshot(funnel.id, payload);
            setOpen(false);
            setValues({});
            setNotes('');
            onAdded();
        } finally {
            setSaving(false);
        }
    }

    return (
        <>
            <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
                + Registrar snapshot
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>Registrar snapshot</DialogTitle></DialogHeader>
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Data</label>
                            <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1" />
                        </div>
                        {stages.map(s => (
                            <div key={s.name}>
                                <label className="text-sm font-medium">{s.name}</label>
                                <Input
                                    type="number"
                                    className="mt-1"
                                    value={values[s.name] ?? ''}
                                    onChange={e => setValues(v => ({ ...v, [s.name]: e.target.value }))}
                                    placeholder="0"
                                />
                            </div>
                        ))}
                        <div>
                            <label className="text-sm font-medium">Notas</label>
                            <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="mt-1" />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                            <Button type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Registrar'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

// ─── Funnel Visualization ─────────────────────────────────────────────────────

function FunnelVisualization({ snapshot, stages }: { snapshot: Snapshot; stages: StageDef[] }) {
    const ordered = [...snapshot.stageData].sort((a, b) => {
        const ai = stages.findIndex(s => s.name === a.stageName);
        const bi = stages.findIndex(s => s.name === b.stageName);
        return ai - bi;
    });
    const maxVal = Math.max(...ordered.map(s => s.value), 1);
    const bottleneck = findBottleneck(ordered);

    return (
        <div className="space-y-3">
            {ordered.map((stage, i) => {
                const widthPct = (stage.value / maxVal) * 100;
                const isBottleneck = stage.stageName === bottleneck;
                const convRate = i > 0 ? pct(ordered[i - 1].value, stage.value) : null;

                return (
                    <div key={stage.stageName}>
                        <div className="flex items-center gap-3 text-sm mb-1">
                            <span className="w-32 font-medium truncate">{stage.stageName}</span>
                            <span className="text-gray-500 w-20 text-right">{stage.value.toLocaleString()}</span>
                            {convRate && (
                                <span className="text-xs text-gray-400">← {convRate}</span>
                            )}
                            {isBottleneck && (
                                <span className="flex items-center gap-1 text-xs text-red-600 font-medium">
                                    <AlertTriangle className="w-3 h-3" /> Gargalo
                                </span>
                            )}
                        </div>
                        <div className="h-7 bg-gray-100 rounded overflow-hidden">
                            <div
                                className={`h-full rounded transition-all ${isBottleneck ? 'bg-red-400' : 'bg-primary/70'}`}
                                style={{ width: `${widthPct}%` }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Main View ───────────────────────────────────────────────────────────────

export default function FunnelsView({ initialFunnels }: { initialFunnels: FunnelSummary[] }) {
    const [funnels, setFunnels] = useState<FunnelSummary[]>(initialFunnels);
    const [selectedId, setSelectedId] = useState<string | null>(initialFunnels[0]?.id ?? null);
    const [detail, setDetail] = useState<FunnelDetail | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    async function refreshList() {
        const data = await getFunnels();
        setFunnels(data as unknown as FunnelSummary[]);
    }

    async function loadDetail(id: string) {
        setLoadingDetail(true);
        try {
            const data = await getFunnel(id);
            setDetail(data as unknown as FunnelDetail);
        } finally {
            setLoadingDetail(false);
        }
    }

    useEffect(() => {
        if (selectedId) loadDetail(selectedId);
    }, [selectedId]);

    const latestSnapshot = detail?.snapshots[0] ?? null;

    return (
        <div className="flex gap-6 min-h-[500px]">
            {/* Left: Funnel list */}
            <div className="w-72 shrink-0 space-y-2">
                <CreateFunnelDialog onCreated={async () => { await refreshList(); }} />
                <div className="mt-4 space-y-2">
                    {funnels.length === 0 && (
                        <p className="text-sm text-gray-400 text-center py-8">Nenhum funil ainda. Crie o primeiro!</p>
                    )}
                    {funnels.map(f => (
                        <button
                            key={f.id}
                            onClick={() => setSelectedId(f.id)}
                            className={`w-full text-left p-3 rounded-lg border transition-colors ${selectedId === f.id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:bg-gray-50'}`}
                        >
                            <div className="font-medium text-sm">{f.name}</div>
                            <div className="text-xs text-gray-400 mt-0.5">{f.stages.length} etapas · {f._count.snapshots} snapshots</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Right: Detail */}
            <div className="flex-1 min-w-0">
                {!selectedId && (
                    <div className="flex items-center justify-center h-64 text-gray-400">
                        Selecione um funil à esquerda
                    </div>
                )}
                {selectedId && loadingDetail && <div className="text-gray-400 p-8">Carregando...</div>}
                {selectedId && detail && !loadingDetail && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold">{detail.name}</h2>
                                {detail.description && <p className="text-sm text-gray-500">{detail.description}</p>}
                            </div>
                            <AddSnapshotDialog funnel={detail} onAdded={() => loadDetail(detail.id)} />
                        </div>

                        <Tabs defaultValue="visualization">
                            <TabsList>
                                <TabsTrigger value="visualization">Visualização</TabsTrigger>
                                <TabsTrigger value="snapshots">Snapshots ({detail.snapshots.length})</TabsTrigger>
                                <TabsTrigger value="experiments">Experimentos</TabsTrigger>
                            </TabsList>

                            {/* Visualization */}
                            <TabsContent value="visualization" className="mt-4">
                                {!latestSnapshot ? (
                                    <div className="text-gray-400 text-sm py-8 text-center">
                                        Nenhum snapshot registrado. Clique em "Registrar snapshot" para começar.
                                    </div>
                                ) : (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-sm text-gray-500">
                                                Snapshot mais recente — {formatDate(latestSnapshot.snapshotDate)}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <FunnelVisualization snapshot={latestSnapshot} stages={detail.stages} />
                                        </CardContent>
                                    </Card>
                                )}
                            </TabsContent>

                            {/* Snapshots history */}
                            <TabsContent value="snapshots" className="mt-4 space-y-3">
                                {detail.snapshots.length === 0 && (
                                    <p className="text-gray-400 text-sm">Nenhum snapshot ainda.</p>
                                )}
                                {detail.snapshots.map((snap, i) => (
                                    <Card key={snap.id}>
                                        <CardHeader className="pb-2">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-sm">{formatDate(snap.snapshotDate)}</CardTitle>
                                                {i === 0 && <Badge variant="secondary">Mais recente</Badge>}
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-wrap gap-3">
                                                {snap.stageData.map((s, j) => {
                                                    const prev = j > 0 ? snap.stageData[j - 1].value : null;
                                                    return (
                                                        <div key={s.stageName} className="text-center">
                                                            <div className="text-xs text-gray-400">{s.stageName}</div>
                                                            <div className="font-bold">{s.value.toLocaleString()}</div>
                                                            {prev != null && <div className="text-xs text-gray-400">{pct(prev, s.value)}</div>}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            {snap.notes && <p className="text-xs text-gray-500 mt-2 italic">{snap.notes}</p>}
                                        </CardContent>
                                    </Card>
                                ))}
                            </TabsContent>

                            {/* Experiments */}
                            <TabsContent value="experiments" className="mt-4">
                                {detail.stageLinks.length === 0 ? (
                                    <p className="text-gray-400 text-sm">Nenhum experimento vinculado a este funil.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {detail.stageLinks.map(link => (
                                            <div key={link.id} className="flex items-center gap-3 p-3 border rounded-lg">
                                                <Badge variant="outline" className="text-xs">{link.stageName}</Badge>
                                                <span className="text-sm font-medium">{link.experiment.title}</span>
                                                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${link.experiment.status === 'in_progress' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                    {{ idea: 'Ideia', backlog: 'Backlog', in_progress: 'Em execução', paused: 'Pausado', completed: 'Concluído', archived: 'Arquivado' }[link.experiment.status] ?? link.experiment.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>
                )}
            </div>
        </div>
    );
}
