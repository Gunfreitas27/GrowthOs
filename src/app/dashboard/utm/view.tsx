"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Link2,
  Copy,
  Check,
  ExternalLink,
  Search,
  Plus,
  Trash2,
  Globe,
  MousePointerClick,
  Radio,
  Loader2,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import {
  getUtmLinks,
  createUtmLink,
  deleteUtmLink,
  type UtmFormValues,
} from "./actions";

const COLORS = {
  pulse: "#6B4FE8",
  velocity: "#1AD3C5",
  insight: "#F59E0B",
  signal: "#EF4444",
  mist: "#A8A3C7",
};

const SOURCE_OPTIONS = [
  { value: "google", label: "Google" },
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "twitter", label: "Twitter / X" },
  { value: "tiktok", label: "TikTok" },
  { value: "email", label: "Email" },
  { value: "newsletter", label: "Newsletter" },
  { value: "blog", label: "Blog" },
  { value: "organic", label: "Orgânico" },
  { value: "direct", label: "Direto" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "youtube", label: "YouTube" },
];

const MEDIUM_OPTIONS = [
  { value: "cpc", label: "CPC / Pago" },
  { value: "organic", label: "Orgânico" },
  { value: "social", label: "Social" },
  { value: "email", label: "Email" },
  { value: "referral", label: "Referral" },
  { value: "affiliate", label: "Afiliado" },
  { value: "video", label: "Vídeo" },
  { value: "display", label: "Display" },
  { value: "cpm", label: "CPM" },
  { value: "push", label: "Push" },
  { value: "sms", label: "SMS" },
];

interface UtmLinkData {
  id: string;
  baseUrl: string;
  source: string;
  medium: string;
  campaign: string | null;
  term: string | null;
  content: string | null;
  shortCode: string | null;
  clicks: number;
  createdAt: string;
}

function generateUtmUrl(base: string, params: Record<string, string>): string {
  try {
    const url = new URL(base);
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.set(`utm_${key}`, value);
    });
    return url.toString();
  } catch {
    return base;
  }
}

interface UtmPageProps {
  initialLinks: UtmLinkData[];
}

export default function UtmHubView({ initialLinks }: UtmPageProps) {
  const [links, setLinks] = useState<UtmLinkData[]>(initialLinks);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showBuilder, setShowBuilder] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newLink, setNewLink] = useState({
    baseUrl: "",
    source: "",
    medium: "",
    campaign: "",
    term: "",
    content: "",
  });

  const fetchLinks = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getUtmLinks(search);
      setLinks(result);
      setError(null);
    } catch (err) {
      setError("Erro ao carregar links");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const filteredLinks = links.filter(
    (link) =>
      link.baseUrl.toLowerCase().includes(search.toLowerCase()) ||
      (link.campaign || "").toLowerCase().includes(search.toLowerCase()) ||
      link.source.toLowerCase().includes(search.toLowerCase()),
  );

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getFullUrl = (link: UtmLinkData): string => {
    return generateUtmUrl(link.baseUrl, {
      source: link.source,
      medium: link.medium,
      campaign: link.campaign || "",
      term: link.term || "",
      content: link.content || "",
    });
  };

  const handleCreateLink = async () => {
    if (
      !newLink.baseUrl ||
      !newLink.source ||
      !newLink.medium ||
      !newLink.campaign
    ) {
      return;
    }

    setCreating(true);
    try {
      const data: UtmFormValues = {
        baseUrl: newLink.baseUrl,
        source: newLink.source,
        medium: newLink.medium,
        campaign: newLink.campaign,
        term: newLink.term || undefined,
        content: newLink.content || undefined,
      };
      const created = await createUtmLink(data);
      setLinks([created, ...links]);
      setShowBuilder(false);
      setNewLink({
        baseUrl: "",
        source: "",
        medium: "",
        campaign: "",
        term: "",
        content: "",
      });
    } catch (err) {
      setError("Erro ao criar link");
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    const prev = links;
    setLinks(links.filter((l) => l.id !== id));
    try {
      await deleteUtmLink(id);
    } catch {
      setLinks(prev);
      setError("Erro ao deletar link");
    }
  };

  const totalClicks = links.reduce((acc, l) => acc + l.clicks, 0);
  const activeSources = [...new Set(links.map((l) => l.source))].length;

  return (
    <div className="space-y-6">
      {error && (
        <div
          className="flex items-center gap-3 p-4 rounded-lg"
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.25)",
          }}
        >
          <AlertTriangle className="w-5 h-5" style={{ color: COLORS.signal }} />
          <span
            className="text-sm"
            style={{ color: COLORS.signal }}
          >
            {error}
          </span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-xs hover:underline"
            style={{ color: COLORS.mist }}
          >
            Fechar
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card
          style={{
            background: "rgba(26,24,46,0.6)",
            border: "1px solid rgba(107,79,232,0.15)",
            borderRadius: "12px",
          }}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="velox-label" style={{ color: COLORS.mist }}>
                  Total de Links
                </p>
                <p
                  className="velox-data"
                  style={{
                    fontSize: "32px",
                    fontWeight: 600,
                    color: "#F8F7FC",
                    marginTop: "4px",
                  }}
                >
                  {links.length}
                </p>
              </div>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: "rgba(107,79,232,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Link2
                  className="w-5 h-5"
                  style={{ color: COLORS.pulse }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          style={{
            background: "rgba(26,24,46,0.6)",
            border: "1px solid rgba(107,79,232,0.15)",
            borderRadius: "12px",
          }}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="velox-label" style={{ color: COLORS.mist }}>
                  Total de Cliques
                </p>
                <p
                  className="velox-data"
                  style={{
                    fontSize: "32px",
                    fontWeight: 600,
                    color: COLORS.velocity,
                    marginTop: "4px",
                  }}
                >
                  {totalClicks.toLocaleString()}
                </p>
              </div>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: "rgba(26,211,197,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MousePointerClick
                  className="w-5 h-5"
                  style={{ color: COLORS.velocity }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          style={{
            background: "rgba(26,24,46,0.6)",
            border: "1px solid rgba(107,79,232,0.15)",
            borderRadius: "12px",
          }}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="velox-label" style={{ color: COLORS.mist }}>
                  Canais Ativos
                </p>
                <p
                  className="velox-data"
                  style={{
                    fontSize: "32px",
                    fontWeight: 600,
                    color: "#F8F7FC",
                    marginTop: "4px",
                  }}
                >
                  {activeSources}
                </p>
              </div>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: "rgba(245,158,11,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Radio
                  className="w-5 h-5"
                  style={{ color: COLORS.insight }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* UTM Builder */}
      {showBuilder && (
        <Card
          style={{
            background: "rgba(26,24,46,0.8)",
            border: "1px solid rgba(107,79,232,0.3)",
            borderRadius: "12px",
          }}
        >
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "16px",
                color: "#F8F7FC",
              }}
            >
              Gerador de URL UTM
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBuilder(false)}
              style={{ color: COLORS.mist }}
            >
              ✕ Fechar
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="baseUrl" style={{ color: COLORS.mist }}>
                  URL Base
                </Label>
                <Input
                  id="baseUrl"
                  placeholder="https://seudominio.com/landing"
                  value={newLink.baseUrl}
                  onChange={(e) =>
                    setNewLink({ ...newLink, baseUrl: e.target.value })
                  }
                  style={{
                    background: "rgba(26,24,46,0.6)",
                    borderColor: "rgba(107,79,232,0.2)",
                    color: "#F8F7FC",
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label style={{ color: COLORS.mist }}>
                  Source (utm_source)
                </Label>
                <Select
                  value={newLink.source}
                  onValueChange={(v) => setNewLink({ ...newLink, source: v })}
                >
                  <SelectTrigger
                    style={{
                      background: "rgba(26,24,46,0.6)",
                      borderColor: "rgba(107,79,232,0.2)",
                      color: "#F8F7FC",
                    }}
                  >
                    <SelectValue placeholder="Selecione a source" />
                  </SelectTrigger>
                  <SelectContent>
                    {SOURCE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label style={{ color: COLORS.mist }}>
                  Medium (utm_medium)
                </Label>
                <Select
                  value={newLink.medium}
                  onValueChange={(v) => setNewLink({ ...newLink, medium: v })}
                >
                  <SelectTrigger
                    style={{
                      background: "rgba(26,24,46,0.6)",
                      borderColor: "rgba(107,79,232,0.2)",
                      color: "#F8F7FC",
                    }}
                  >
                    <SelectValue placeholder="Selecione o medium" />
                  </SelectTrigger>
                  <SelectContent>
                    {MEDIUM_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="campaign" style={{ color: COLORS.mist }}>
                  Campaign (utm_campaign)
                </Label>
                <Input
                  id="campaign"
                  placeholder="nome-da-campanha"
                  value={newLink.campaign}
                  onChange={(e) =>
                    setNewLink({ ...newLink, campaign: e.target.value })
                  }
                  style={{
                    background: "rgba(26,24,46,0.6)",
                    borderColor: "rgba(107,79,232,0.2)",
                    color: "#F8F7FC",
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="term" style={{ color: COLORS.mist }}>
                  Term (utm_term) - Opcional
                </Label>
                <Input
                  id="term"
                  placeholder="palavra-chave"
                  value={newLink.term}
                  onChange={(e) =>
                    setNewLink({ ...newLink, term: e.target.value })
                  }
                  style={{
                    background: "rgba(26,24,46,0.6)",
                    borderColor: "rgba(107,79,232,0.2)",
                    color: "#F8F7FC",
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content" style={{ color: COLORS.mist }}>
                  Content (utm_content) - Opcional
                </Label>
                <Input
                  id="content"
                  placeholder="banner-topo"
                  value={newLink.content}
                  onChange={(e) =>
                    setNewLink({ ...newLink, content: e.target.value })
                  }
                  style={{
                    background: "rgba(26,24,46,0.6)",
                    borderColor: "rgba(107,79,232,0.2)",
                    color: "#F8F7FC",
                  }}
                />
              </div>
            </div>

            {newLink.baseUrl &&
              newLink.source &&
              newLink.medium &&
              newLink.campaign && (
                <div
                  className="p-4 rounded-lg mt-4"
                  style={{
                    background: "rgba(26,217,197,0.1)",
                    border: "1px solid rgba(26,217,197,0.3)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Globe
                      className="w-4 h-4"
                      style={{ color: COLORS.velocity }}
                    />
                    <p
                      className="velox-label"
                      style={{ color: COLORS.velocity }}
                    >
                      URL Gerada
                    </p>
                  </div>
                  <code
                    className="text-xs break-all block"
                    style={{
                      color: "#F8F7FC",
                      fontFamily: "var(--font-data)",
                    }}
                  >
                    {generateUtmUrl(newLink.baseUrl, {
                      source: newLink.source,
                      medium: newLink.medium,
                      campaign: newLink.campaign,
                      term: newLink.term,
                      content: newLink.content,
                    })}
                  </code>
                </div>
              )}

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowBuilder(false)}
                style={{
                  borderColor: "rgba(107,79,232,0.3)",
                  color: COLORS.mist,
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateLink}
                disabled={creating}
                style={{
                  background: COLORS.pulse,
                  color: "white",
                }}
              >
                {creating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                {creating ? "Criando..." : "Criar Link"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Links Table */}
      <Card
        style={{
          background: "rgba(26,24,46,0.6)",
          border: "1px solid rgba(107,79,232,0.15)",
          borderRadius: "12px",
        }}
      >
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "16px",
              color: "#F8F7FC",
            }}
          >
            Links UTM
          </CardTitle>
          <div className="flex gap-2">
            <div className="relative" style={{ width: "240px" }}>
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: COLORS.mist }}
              />
              <Input
                placeholder="Buscar links..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
                style={{
                  background: "rgba(26,24,46,0.6)",
                  borderColor: "rgba(107,79,232,0.2)",
                  color: "#F8F7FC",
                }}
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={fetchLinks}
              disabled={loading}
              style={{
                borderColor: "rgba(107,79,232,0.3)",
                color: COLORS.mist,
              }}
              title="Recarregar"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            </Button>
            <Button
              onClick={() => setShowBuilder(!showBuilder)}
              style={{
                background: COLORS.pulse,
                color: "white",
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Link
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid rgba(107,79,232,0.15)",
                  }}
                >
                  <th
                    className="text-left py-3 px-4 velox-label"
                    style={{ color: COLORS.mist }}
                  >
                    URL
                  </th>
                  <th
                    className="text-left py-3 px-4 velox-label"
                    style={{ color: COLORS.mist }}
                  >
                    Source
                  </th>
                  <th
                    className="text-left py-3 px-4 velox-label"
                    style={{ color: COLORS.mist }}
                  >
                    Medium
                  </th>
                  <th
                    className="text-left py-3 px-4 velox-label"
                    style={{ color: COLORS.mist }}
                  >
                    Campaign
                  </th>
                  <th
                    className="text-right py-3 px-4 velox-label"
                    style={{ color: COLORS.mist }}
                  >
                    Cliques
                  </th>
                  <th
                    className="text-right py-3 px-4 velox-label"
                    style={{ color: COLORS.mist }}
                  >
                    Criado em
                  </th>
                  <th
                    className="text-right py-3 px-4 velox-label"
                    style={{ color: COLORS.mist }}
                  >
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12">
                      <Loader2
                        className="w-8 h-8 mx-auto animate-spin"
                        style={{ color: COLORS.mist }}
                      />
                    </td>
                  </tr>
                ) : (
                  filteredLinks.map((link) => (
                    <tr
                      key={link.id}
                      style={{
                        borderBottom: "1px solid rgba(107,79,232,0.08)",
                      }}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Link2
                            className="w-4 h-4 shrink-0"
                            style={{ color: COLORS.pulse }}
                          />
                          <code
                            className="text-xs truncate max-w-[180px]"
                            style={{
                              color: "#F8F7FC",
                              fontFamily: "var(--font-data)",
                            }}
                            title={getFullUrl(link)}
                          >
                            {getFullUrl(link)}
                          </code>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className="px-2 py-1 rounded text-xs"
                          style={{
                            background: `${COLORS.pulse}20`,
                            color: COLORS.pulse,
                          }}
                        >
                          {link.source}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className="px-2 py-1 rounded text-xs"
                          style={{
                            background: `${COLORS.velocity}20`,
                            color: COLORS.velocity,
                          }}
                        >
                          {link.medium}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          style={{
                            color: "#F8F7FC",
                            fontFamily: "var(--font-ui)",
                            fontSize: "13px",
                          }}
                        >
                          {link.campaign}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className="velox-data"
                          style={{
                            color: "#F8F7FC",
                            fontSize: "14px",
                          }}
                        >
                          {link.clicks.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          style={{
                            color: COLORS.mist,
                            fontSize: "12px",
                          }}
                        >
                          {link.createdAt}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              copyToClipboard(getFullUrl(link), link.id)
                            }
                            style={{ color: COLORS.mist }}
                            title="Copiar URL"
                          >
                            {copiedId === link.id ? (
                              <Check
                                className="w-4 h-4"
                                style={{ color: COLORS.velocity }}
                              />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            style={{ color: COLORS.mist }}
                            title="Abrir em nova aba"
                          >
                            <a
                              href={getFullUrl(link)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => {
                                const l = links.find(l => l.id === link.id);
                                if (l) {
                                  l.clicks += 1;
                                  setLinks([...links]);
                                }
                              }}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(link.id)}
                            style={{ color: COLORS.signal }}
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {!loading && filteredLinks.length === 0 && (
              <div className="text-center py-12">
                <Link2
                  className="w-12 h-12 mx-auto mb-4"
                  style={{ color: COLORS.mist, opacity: 0.5 }}
                />
                <p
                  style={{
                    color: COLORS.mist,
                    fontFamily: "var(--font-ui)",
                  }}
                >
                  Nenhum link UTM encontrado
                </p>
                <p
                  className="text-sm mt-1"
                  style={{ color: COLORS.mist, opacity: 0.7 }}
                >
                  {search
                    ? "Nenhum resultado para sua busca."
                    : "Crie seu primeiro link UTM para começar a rastrear suas campanhas."}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
