import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ChannelsView from "./view";

export default async function ChannelsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (!session.user.organizationId) {
    redirect("/onboarding");
  }

  const channels = await prisma.channel.findMany({
    where: { organizationId: session.user.organizationId },
    include: {
      metrics: {
        orderBy: { date: "desc" },
        take: 30,
      },
      spends: {
        orderBy: { date: "desc" },
        take: 30,
      },
    },
  });

  const initialChannels = channels.map((ch) => {
    const aggregated = ch.metrics.reduce(
      (acc, m) => ({
        impressions: (acc.impressions || 0) + (m.impressions || 0),
        clicks: (acc.clicks || 0) + (m.clicks || 0),
        spend: (acc.spend || 0) + Number(m.spend || 0),
        revenue: (acc.revenue || 0) + Number(m.revenue || 0),
        conversions: (acc.conversions || 0) + (m.conversions || 0),
      }),
      {} as Record<string, number>,
    );

    const totalSpend = ch.spends.reduce((acc, s) => acc + Number(s.amount), 0);
    const latestMetrics = ch.metrics[0];

    return {
      id: ch.id,
      connectorType: ch.connectorType,
      displayName: ch.displayName,
      status: ch.status,
      lastSyncAt: ch.lastSyncAt?.toISOString() || null,
      metrics: {
        impressions: aggregated.impressions || latestMetrics?.impressions || 0,
        clicks: aggregated.clicks || latestMetrics?.clicks || 0,
        spend: totalSpend || aggregated.spend || 0,
        revenue: aggregated.revenue || 0,
        conversions: aggregated.conversions || latestMetrics?.conversions || 0,
        roas: aggregated.spend > 0 ? +(aggregated.revenue / aggregated.spend).toFixed(2) : 0,
        ctr: latestMetrics?.ctr ? Number(latestMetrics.ctr) : 0,
        cpc: latestMetrics?.cpc ? Number(latestMetrics.cpc) : 0,
        cpm: latestMetrics?.cpm ? Number(latestMetrics.cpm) : 0,
        users: latestMetrics?.users || 0,
        sessions: latestMetrics?.sessions || 0,
      },
      dailyMetrics: ch.metrics.reverse().map((m) => ({
        date: m.date.toISOString().split("T")[0],
        impressions: m.impressions || 0,
        clicks: m.clicks || 0,
        spend: Number(m.spend || 0),
        revenue: Number(m.revenue || 0),
        conversions: m.conversions || 0,
      })),
      spends: ch.spends.reverse().map((s) => ({
        date: s.date.toISOString().split("T")[0],
        amount: Number(s.amount),
        campaign: s.campaignName || "",
      })),
    };
  });

  return (
    <div style={{ padding: "40px 40px 32px" }}>
      <div
        style={{
          marginBottom: "32px",
          paddingBottom: "24px",
          borderBottom: "1px solid rgba(107,79,232,0.12)",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
            background: "rgba(107,79,232,0.1)",
            border: "1px solid rgba(107,79,232,0.25)",
            borderRadius: "100px",
            padding: "5px 12px",
            marginBottom: "12px",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-data)",
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              color: "var(--velox-mist)",
            }}
          >
            Canais
          </span>
        </div>

        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "clamp(24px, 3vw, 32px)",
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            color: "#F8F7FC",
            marginBottom: "8px",
          }}
        >
          Performance de Canais
        </h1>
        <p
          style={{
            fontFamily: "var(--font-ui)",
            fontSize: "14px",
            color: "var(--velox-mist)",
          }}
        >
          Visão unificada de todos os seus canais de marketing.
        </p>
      </div>

      <ChannelsView initialChannels={initialChannels} />
    </div>
  );
}
