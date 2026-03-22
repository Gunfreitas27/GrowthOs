"use client";

import { useState } from "react";
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
  Filter,
  Plus,
  Trash2,
  Edit,
} from "lucide-react";

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
  { value: "email", label: "Email" },
  { value: "newsletter", label: "Newsletter" },
  { value: "blog", label: "Blog" },
  { value: "organic", label: "Orgânico" },
  { value: "direct", label: "Direto" },
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
];

interface UtmLink {
  id: string;
  baseUrl: string;
  source: string;
  medium: string;
  campaign: string;
  term?: string;
  content?: string;
  shortCode?: string;
  clicks: number;
  createdAt: string;
}

const mockLinks: UtmLink[] = [
  {
    id: "1",
    baseUrl: "https://seudominio.com/landing",
    source: "google",
    medium: "cpc",
    campaign: "black-friday-2024",
    term: "software-gestao",
    clicks: 1245,
    createdAt: "2024-03-01",
  },
  {
    id: "2",
    baseUrl: "https://seudominio.com/landing",
    source: "facebook",
    medium: "social",
    campaign: "fb-remarketing-marca",
    content: "banner-topo",
    clicks: 892,
    createdAt: "2024-03-05",
  },
  {
    id: "3",
    baseUrl: "https://seudominio.com/precos",
    source: "linkedin",
    medium: "social",
    campaign: "b2b-q1-2024",
    content: "cta-empresa",
    clicks: 456,
    createdAt: "2024-03-10",
  },
  {
    id: "4",
    baseUrl: "https://seudominio.com/blog",
    source: "email",
    medium: "email",
    campaign: "newsletter-march",
    content: "header-link",
    clicks: 2341,
    createdAt: "2024-03-15",
  },
  {
    id: "5",
    baseUrl: "https://seudominio.com/trial",
    source: "google",
    medium: "cpc",
    campaign: "trial-gratuito-br",
    clicks: 3204,
    createdAt: "2024-03-18",
  },
];

function generateUtmUrl(base: string, params: Record<string, string>): string {
  const url = new URL(base);
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.set(`utm_${key}`, value);
  });
  return url.toString();
}

export default function UtmHubView() {
  const [links, setLinks] = useState<UtmLink[]>(mockLinks);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showBuilder, setShowBuilder] = useState(false);
  const [newLink, setNewLink] = useState({
    baseUrl: "",
    source: "",
    medium: "",
    campaign: "",
    term: "",
    content: "",
  });

  const filteredLinks = links.filter(
    (link) =>
      link.baseUrl.toLowerCase().includes(search.toLowerCase()) ||
      link.campaign.toLowerCase().includes(search.toLowerCase()) ||
      link.source.toLowerCase().includes(search.toLowerCase()),
  );

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getFullUrl = (link: UtmLink): string => {
    return generateUtmUrl(link.baseUrl, {
      source: link.source,
      medium: link.medium,
      campaign: link.campaign,
      term: link.term || "",
      content: link.content || "",
    });
  };

  const handleCreateLink = () => {
    if (
      !newLink.baseUrl ||
      !newLink.source ||
      !newLink.medium ||
      !newLink.campaign
    ) {
      return;
    }

    const link: UtmLink = {
      id: Date.now().toString(),
      ...newLink,
      clicks: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };

    setLinks([link, ...links]);
    setShowBuilder(false);
    setNewLink({
      baseUrl: "",
      source: "",
      medium: "",
      campaign: "",
      term: "",
      content: "",
    });
  };

  const deleteLink = (id: string) => {
    setLinks(links.filter((l) => l.id !== id));
  };

  const totalClicks = links.reduce((acc, l) => acc + l.clicks, 0);

  return (
    <div className="space-y-6">
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
              {[...new Set(links.map((l) => l.source))].length}
            </p>
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
                  <p
                    className="velox-label mb-2"
                    style={{ color: COLORS.velocity }}
                  >
                    URL Gerada
                  </p>
                  <div className="flex items-center gap-2">
                    <code
                      className="flex-1 text-xs break-all"
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
                style={{
                  background: COLORS.pulse,
                  color: "white",
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Link
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
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLinks.map((link) => (
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
                          className="text-xs truncate max-w-[200px]"
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
                    <td className="py-3 px-4">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(getFullUrl(link), link.id)
                          }
                          style={{ color: COLORS.mist }}
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
                        >
                          <a
                            href={getFullUrl(link)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteLink(link.id)}
                          style={{ color: COLORS.signal }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredLinks.length === 0 && (
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
                  Crie seu primeiro link UTM para começar a rastrear suas
                  campanhas.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
