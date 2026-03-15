import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardView from "./view";

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    if (!session.user.organizationId) {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { organization: true }
        });

        if (!user?.organizationId) {
            redirect("/onboarding");
        }
    }

    const firstName = session.user.name?.split(' ')[0] ?? 'Growth Lead';

    return (
        <div style={{ padding: '40px 40px 32px' }}>
            {/* ─── Page header ─────────────────────────────────────────── */}
            <div
                style={{
                    marginBottom: '40px',
                    paddingBottom: '32px',
                    borderBottom: '1px solid rgba(107,79,232,0.12)',
                }}
            >
                {/* Badge */}
                <div
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '7px',
                        background: 'rgba(107,79,232,0.1)',
                        border: '1px solid rgba(107,79,232,0.25)',
                        borderRadius: '100px',
                        padding: '5px 12px',
                        marginBottom: '16px',
                    }}
                >
                    <div
                        className="velox-dot-running"
                        style={{ background: 'var(--velox-velocity)' }}
                    />
                    <span
                        style={{
                            fontFamily: 'var(--font-data)',
                            fontSize: '11px',
                            fontWeight: 500,
                            letterSpacing: '0.07em',
                            textTransform: 'uppercase',
                            color: 'var(--velox-mist)',
                        }}
                    >
                        Visão Geral
                    </span>
                </div>

                {/* Title */}
                <h1
                    style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 800,
                        fontSize: 'clamp(26px, 3vw, 36px)',
                        letterSpacing: '-0.03em',
                        lineHeight: 1.1,
                        color: '#F8F7FC',
                        marginBottom: '8px',
                    }}
                >
                    Olá, {firstName}.{' '}
                    <span
                        style={{
                            background: 'linear-gradient(90deg, #6B4FE8, #1AD3C5)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}
                    >
                        Seu growth, em tempo real.
                    </span>
                </h1>
                <p
                    style={{
                        fontFamily: 'var(--font-ui)',
                        fontSize: '14px',
                        color: 'var(--velox-mist)',
                    }}
                >
                    {session.user.email}
                </p>
            </div>

            {/* ─── Dashboard content ───────────────────────────────────── */}
            <DashboardView />
        </div>
    );
}
