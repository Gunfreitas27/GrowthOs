import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ChannelsView from "./view";

export default async function ChannelsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (!session.user.organizationId) {
    redirect("/onboarding");
  }

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

      <ChannelsView />
    </div>
  );
}
