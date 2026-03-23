"use client";

import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Pencil,
  ChevronRight,
  X,
  GripVertical,
  Filter,
  Search,
  FlaskConical,
  Trophy,
  TrendingDown,
  Minus,
  User,
  Tag,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  getExperiments,
  createExperiment,
  updateExperiment,
  updateExperimentStatus,
  ExperimentFormValues,
} from "./actions";
import { getScoreMethod } from "@/lib/scoring";

const COLORS = {
  pulse: "#6B4FE8",
  velocity: "#1AD3C5",
  insight: "#F59E0B",
  signal: "#EF4444",
  mist: "#A8A3C7",
};

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

const COLUMNS: { id: string; label: string; color: string }[] = [
  { id: "idea", label: "Ideias", color: "#A8A3C7" },
  { id: "backlog", label: "Backlog", color: "#6B4FE8" },
  { id: "in_progress", label: "Em Execução", color: "#F59E0B" },
  { id: "completed", label: "Concluídos", color: "#1AD3C5" },
  { id: "archived", label: "Arquivados", color: "#A8A3C7" },
];

const STATUS_NEXT: Record<string, string | null> = {
  idea: "backlog",
  backlog: "in_progress",
  in_progress: "completed",
  completed: null,
  archived: null,
  paused: "in_progress",
};

const STAGE_LABELS: Record<string, string> = {
  awareness: "Reconhecimento",
  acquisition: "Aquisição",
  activation: "Ativação",
  retention: "Retenção",
  revenue: "Receita",
  referral: "Indicação",
};

const STAGE_COLORS: Record<string, string> = {
  awareness: "#A855F7",
  acquisition: "#3B82F6",
  activation: "#22C55E",
  retention: "#EAB308",
  revenue: "#10B981",
  referral: "#EC4899",
};

const RESULT_CONFIG = {
  win: {
    label: "Win",
    color: "#1AD3C5",
    bg: "rgba(26,211,197,0.15)",
    icon: Trophy,
  },
  loss: {
    label: "Loss",
    color: "#EF4444",
    bg: "rgba(239,68,68,0.15)",
    icon: TrendingDown,
  },
  inconclusive: {
    label: "Inconclusivo",
    color: "#A8A3C7",
    bg: "rgba(168,163,199,0.15)",
    icon: Minus,
  },
};

const formSchema = z.object({
  title: z.string().min(1, "Título obrigatório"),
  description: z.string().optional().nullable(),
  hypothesis: z.string().optional().nullable(),
  funnelStage: z.enum([
    "awareness",
    "acquisition",
    "activation",
    "retention",
    "revenue",
    "referral",
  ]),
  status: z.enum([
    "idea",
    "backlog",
    "in_progress",
    "paused",
    "completed",
    "archived",
  ]),
  iceImpact: z.coerce.number().min(1).max(10).optional().nullable(),
  iceConfidence: z.coerce.number().min(1).max(10).optional().nullable(),
  iceEase: z.coerce.number().min(1).max(10).optional().nullable(),
  riceReach: z.coerce.number().min(0).optional().nullable(),
  riceImpact: z.coerce.number().min(1).max(3).optional().nullable(),
  riceConfidence: z.coerce.number().min(0).max(100).optional().nullable(),
  riceEffort: z.coerce.number().min(0.1).optional().nullable(),
  ownerId: z.string().optional().nullable(),
  tags: z.string().default(""),
  relatedMetric: z.string().optional().nullable(),
  expectedLift: z.coerce.number().optional().nullable(),
  actualLift: z.coerce.number().optional().nullable(),
  result: z.enum(["win", "loss", "inconclusive"]).optional().nullable(),
  learning: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

const DEFAULT_VALUES: FormValues = {
  title: "",
  description: "",
  hypothesis: "",
  funnelStage: "acquisition",
  status: "idea",
  iceImpact: null,
  iceConfidence: null,
  iceEase: null,
  riceReach: null,
  riceImpact: null,
  riceConfidence: null,
  riceEffort: null,
  ownerId: null,
  tags: "",
  relatedMetric: "",
  expectedLift: null,
  actualLift: null,
  result: null,
  learning: "",
};

function experimentToFormValues(e: Experiment): FormValues {
  return {
    title: e.title,
    description: e.description ?? "",
    hypothesis: e.hypothesis ?? "",
    funnelStage: e.funnelStage as FormValues["funnelStage"],
    status: e.status as FormValues["status"],
    iceImpact: e.iceImpact,
    iceConfidence: e.iceConfidence,
    iceEase: e.iceEase,
    riceReach: e.riceReach,
    riceImpact: e.riceImpact,
    riceConfidence: e.riceConfidence,
    riceEffort: e.riceEffort,
    ownerId: e.ownerId,
    tags: e.tags.join(", "),
    relatedMetric: e.relatedMetric ?? "",
    expectedLift: e.expectedLift,
    actualLift: e.actualLift,
    result: (e.result as FormValues["result"]) ?? null,
    learning: e.learning ?? "",
  };
}

function ScoreBadge({
  score,
  method,
}: {
  score: number | null;
  method: string | null;
}) {
  if (!score || !method) return null;

  return (
    <div
      className="flex items-center gap-1.5 px-2 py-1 rounded-md"
      style={{ background: "rgba(107,79,232,0.15)" }}
    >
      <span
        className="text-[10px] font-medium uppercase tracking-wide"
        style={{ color: COLORS.mist }}
      >
        {method}
      </span>
      <span className="text-sm font-bold" style={{ color: COLORS.pulse }}>
        {score.toFixed(1)}
      </span>
    </div>
  );
}

function ExperimentCard({
  experiment,
  onEdit,
  onStatusChange,
}: {
  experiment: Experiment;
  onEdit: (e: Experiment) => void;
  onStatusChange: (id: string, status: string) => void;
}) {
  const method = getScoreMethod(
    {
      iceImpact: experiment.iceImpact ?? undefined,
      iceConfidence: experiment.iceConfidence ?? undefined,
      iceEase: experiment.iceEase ?? undefined,
    },
    {
      riceReach: experiment.riceReach ?? undefined,
      riceImpact: experiment.riceImpact ?? undefined,
      riceConfidence: experiment.riceConfidence ?? undefined,
      riceEffort: experiment.riceEffort ?? undefined,
    },
  );

  const resultConfig = experiment.result
    ? RESULT_CONFIG[experiment.result as keyof typeof RESULT_CONFIG]
    : null;
  const ResultIcon = resultConfig?.icon;
  const isPaused = experiment.status === "paused";
  const nextStatus = STATUS_NEXT[experiment.status];

  return (
    <div
      className="group rounded-lg p-3 cursor-pointer transition-all hover:scale-[1.02]"
      style={{
        background: isPaused ? "rgba(245,158,11,0.08)" : "rgba(26,24,46,0.6)",
        border: `1px solid ${isPaused ? "rgba(245,158,11,0.2)" : "rgba(107,79,232,0.12)"}`,
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <GripVertical
            className="w-3 h-3 shrink-0 opacity-30 group-hover:opacity-60"
            style={{ color: COLORS.mist }}
          />
          <ScoreBadge score={experiment.priorityScore} method={method} />
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(experiment);
          }}
          className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10"
        >
          <Pencil className="w-3 h-3" style={{ color: COLORS.mist }} />
        </button>
      </div>

      <p
        className="text-sm font-medium mb-2 line-clamp-2 leading-snug"
        style={{ color: "#F8F7FC" }}
      >
        {experiment.title}
      </p>

      <div className="flex items-center gap-2 mb-2">
        <Badge
          variant="outline"
          className="text-[10px] px-1.5 py-0 border-0"
          style={{
            background: `${STAGE_COLORS[experiment.funnelStage] || COLORS.pulse}20`,
            color: STAGE_COLORS[experiment.funnelStage] || COLORS.pulse,
          }}
        >
          {STAGE_LABELS[experiment.funnelStage] || experiment.funnelStage}
        </Badge>

        {resultConfig && resultConfig.icon && (
          <Badge
            variant="outline"
            className="text-[10px] px-1.5 py-0 border-0"
            style={{ background: resultConfig.bg, color: resultConfig.color }}
          >
            <resultConfig.icon className="w-3 h-3 mr-0.5" />
            {resultConfig.label}
          </Badge>
        )}
      </div>

      <div
        className="flex items-center justify-between pt-2"
        style={{ borderTop: "1px solid rgba(107,79,232,0.08)" }}
      >
        <div className="flex items-center gap-2">
          {experiment.owner && (
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" style={{ color: COLORS.mist }} />
              <span className="text-[10px]" style={{ color: COLORS.mist }}>
                {experiment.owner.name?.split(" ")[0] || "—"}
              </span>
            </div>
          )}
          {experiment.tags.length > 0 && (
            <Tag className="w-3 h-3" style={{ color: COLORS.mist }} />
          )}
        </div>

        {nextStatus && (
          <Button
            size="xs"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(experiment.id, nextStatus);
            }}
            className="h-6 px-2 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: COLORS.velocity }}
          >
            <span className="mr-1">Avançar</span>
            <ChevronRight className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
}

const STAGE_OPTIONS = [
  { value: "awareness", label: "Reconhecimento" },
  { value: "acquisition", label: "Aquisição" },
  { value: "activation", label: "Ativação" },
  { value: "retention", label: "Retenção" },
  { value: "revenue", label: "Receita" },
  { value: "referral", label: "Indicação" },
];

const STATUS_OPTIONS = [
  { value: "idea", label: "Ideia" },
  { value: "backlog", label: "Backlog" },
  { value: "in_progress", label: "Em execução" },
  { value: "paused", label: "Pausado" },
  { value: "completed", label: "Concluído" },
  { value: "archived", label: "Arquivado" },
];

const RESULT_OPTIONS = [
  { value: "none", label: "Sem resultado" },
  { value: "win", label: "🏆 Ganhou" },
  { value: "loss", label: "📉 Perdeu" },
  { value: "inconclusive", label: "➖ Inconclusivo" },
];

export default function ExperimentsView({
  initialExperiments,
  users,
}: {
  initialExperiments: Experiment[];
  users: Owner[];
}) {
  const [experiments, setExperiments] =
    useState<Experiment[]>(initialExperiments);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExperiment, setEditingExperiment] = useState<Experiment | null>(
    null,
  );
  const [filterStage, setFilterStage] = useState("all");
  const [filterOwner, setFilterOwner] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (isDialogOpen) {
      form.reset(
        editingExperiment
          ? experimentToFormValues(editingExperiment)
          : DEFAULT_VALUES,
      );
    }
  }, [isDialogOpen, editingExperiment]);

  const filtered = useMemo(() => {
    return experiments.filter((e) => {
      if (filterStage !== "all" && e.funnelStage !== filterStage) return false;
      if (filterOwner !== "all" && e.ownerId !== filterOwner) return false;
      if (
        searchQuery &&
        !e.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      return true;
    });
  }, [experiments, filterStage, filterOwner, searchQuery]);

  async function refresh() {
    const data = await getExperiments();
    setExperiments(data as unknown as Experiment[]);
  }

  async function onSubmit(values: FormValues) {
    setSaving(true);
    try {
      const payload: ExperimentFormValues = {
        ...values,
        tags: values.tags
          ? values.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
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
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "20px",
              color: "#F8F7FC",
            }}
          >
            Experimentos
          </h2>
          <p className="text-sm mt-0.5" style={{ color: COLORS.mist }}>
            {filtered.length} experimentos ·{" "}
            {filtered.filter((e) => e.status === "in_progress").length} em
            execução
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Experimento
        </Button>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: COLORS.mist }}
          />
          <Input
            placeholder="Buscar experimentos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filterStage} onValueChange={setFilterStage}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Etapa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as etapas</SelectItem>
            {STAGE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterOwner} onValueChange={setFilterOwner}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Responsável" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {users.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.name ?? u.id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4 min-h-[calc(100vh-280px)]">
          {COLUMNS.map((col) => {
            const cards = filtered
              .filter(
                (e) =>
                  e.status === col.id ||
                  (col.id === "in_progress" && e.status === "paused"),
              )
              .sort((a, b) => (b.priorityScore ?? 0) - (a.priorityScore ?? 0));

            return (
              <div
                key={col.id}
                className="flex-shrink-0 w-72 rounded-xl p-3"
                style={{ background: "rgba(26,24,46,0.3)", minHeight: "400px" }}
              >
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: col.color }}
                    />
                    <h3
                      className="text-sm font-medium"
                      style={{ color: "#F8F7FC" }}
                    >
                      {col.label}
                    </h3>
                  </div>
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{
                      background: `${col.color}20`,
                      color: col.color,
                      fontFamily: "var(--font-data)",
                    }}
                  >
                    {cards.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {cards.length === 0 && (
                    <div className="text-center py-8 px-4">
                      <FlaskConical
                        className="w-8 h-8 mx-auto mb-2 opacity-30"
                        style={{ color: COLORS.mist }}
                      />
                      <p className="text-xs" style={{ color: COLORS.mist }}>
                        Nenhum experimento
                      </p>
                    </div>
                  )}
                  {cards.map((e) => (
                    <ExperimentCard
                      key={e.id}
                      experiment={e}
                      onEdit={openEdit}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ color: "#F8F7FC" }}>
              {editingExperiment ? "Editar experimento" : "Novo Experimento"}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <Tabs defaultValue="basic">
                <TabsList className="w-full">
                  <TabsTrigger value="basic" className="flex-1 text-xs">
                    Informações
                  </TabsTrigger>
                  <TabsTrigger value="ice" className="flex-1 text-xs">
                    ICE Score
                  </TabsTrigger>
                  <TabsTrigger value="rice" className="flex-1 text-xs">
                    RICE Score
                  </TabsTrigger>
                  <TabsTrigger value="results" className="flex-1 text-xs">
                    Resultados
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Ex: Testar novo CTA na landing"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hypothesis"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hipótese</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            value={field.value ?? ""}
                            placeholder="Acreditamos que... para... porque..."
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="funnelStage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Etapa do funil</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {STAGE_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {STATUS_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="ownerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Responsável</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value ?? ""}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecionar..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">Sem responsável</SelectItem>
                              {users.map((u) => (
                                <SelectItem key={u.id} value={u.id}>
                                  {u.name ?? u.id}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tags</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="copy, landing, mobile"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="expectedLift"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lift esperado (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? null
                                  : Number(e.target.value),
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="ice" className="space-y-4 pt-4">
                  <div
                    className="p-4 rounded-lg"
                    style={{ background: "rgba(107,79,232,0.08)" }}
                  >
                    <p className="text-sm mb-4" style={{ color: COLORS.mist }}>
                      <strong>ICE Score</strong> = (Impacto × Confiança ×
                      Facilidade) / 3
                    </p>
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="iceImpact"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Impacto (1-10)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                max={10}
                                {...field}
                                value={field.value ?? ""}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value === ""
                                      ? null
                                      : Number(e.target.value),
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="iceConfidence"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confiança (1-10)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                max={10}
                                {...field}
                                value={field.value ?? ""}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value === ""
                                      ? null
                                      : Number(e.target.value),
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="iceEase"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Facilidade (1-10)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                max={10}
                                {...field}
                                value={field.value ?? ""}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value === ""
                                      ? null
                                      : Number(e.target.value),
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="rice" className="space-y-4 pt-4">
                  <div
                    className="p-4 rounded-lg"
                    style={{ background: "rgba(26,211,197,0.08)" }}
                  >
                    <p className="text-sm mb-4" style={{ color: COLORS.mist }}>
                      <strong>RICE Score</strong> = (Alcance × Impacto ×
                      Confiança%) / Esforço
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="riceReach"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Alcance (pessoas/semana)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                value={field.value ?? ""}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value === ""
                                      ? null
                                      : Number(e.target.value),
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="riceImpact"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Impacto (1-3)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                max={3}
                                {...field}
                                value={field.value ?? ""}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value === ""
                                      ? null
                                      : Number(e.target.value),
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="riceConfidence"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confiança (0-100%)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                {...field}
                                value={field.value ?? ""}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value === ""
                                      ? null
                                      : Number(e.target.value),
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="riceEffort"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Esforço (semanas)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={0.1}
                                step={0.5}
                                {...field}
                                value={field.value ?? ""}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value === ""
                                      ? null
                                      : Number(e.target.value),
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="results" className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="result"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Resultado</FormLabel>
                          <Select
                            onValueChange={(v) =>
                              field.onChange(
                                v === "none"
                                  ? null
                                  : (v as "win" | "loss" | "inconclusive"),
                              )
                            }
                            value={field.value ?? "none"}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecionar..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {RESULT_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="actualLift"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lift real (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value === ""
                                    ? null
                                    : Number(e.target.value),
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="learning"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Aprendizado</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            value={field.value ?? ""}
                            placeholder="O que aprendemos com este experimento?"
                            rows={4}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving
                    ? "Salvando..."
                    : editingExperiment
                      ? "Salvar"
                      : "Criar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
