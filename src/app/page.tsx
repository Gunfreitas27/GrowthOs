import Link from "next/link";

// ─── Nav ──────────────────────────────────────────────────────────────────────

function Nav() {
    return (
        <header
            style={{
                position: 'sticky',
                top: 0,
                zIndex: 50,
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                backgroundColor: 'rgba(15,14,26,0.72)',
                borderBottom: '1px solid rgba(107,79,232,0.18)',
            }}
        >
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', height: '60px' }}>
                {/* Wordmark */}
                <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <defs>
                            <linearGradient id="nav-mark" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#2D1B6B" />
                                <stop offset="50%" stopColor="#6B4FE8" />
                                <stop offset="100%" stopColor="#1AD3C5" />
                            </linearGradient>
                        </defs>
                        <path d="M4 4 L12 20 L20 4 L16 4 L12 12 L8 4 Z" fill="url(#nav-mark)" />
                    </svg>
                    <span style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 700,
                        fontSize: '18px',
                        letterSpacing: '-0.03em',
                        color: '#F8F7FC',
                    }}>
                        velox<span style={{ color: 'var(--velox-velocity)', fontStyle: 'italic' }}>x</span>
                    </span>
                </Link>

                <nav style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '32px' }}>
                    <Link href="#features" style={{ fontSize: '14px', color: 'var(--velox-mist)', textDecoration: 'none', fontFamily: 'var(--font-ui)' }}>
                        Features
                    </Link>
                    <Link href="#how-it-works" style={{ fontSize: '14px', color: 'var(--velox-mist)', textDecoration: 'none', fontFamily: 'var(--font-ui)' }}>
                        How it works
                    </Link>
                    <Link
                        href="/login"
                        style={{
                            fontSize: '14px',
                            fontFamily: 'var(--font-ui)',
                            fontWeight: 500,
                            color: '#F8F7FC',
                            textDecoration: 'none',
                        }}
                    >
                        Login
                    </Link>
                    <Link
                        href="/login"
                        style={{
                            fontSize: '14px',
                            fontFamily: 'var(--font-ui)',
                            fontWeight: 600,
                            color: '#F8F7FC',
                            background: 'linear-gradient(135deg, #6B4FE8 0%, #1AD3C5 100%)',
                            padding: '8px 20px',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            letterSpacing: '-0.01em',
                        }}
                    >
                        Começar grátis →
                    </Link>
                </nav>
            </div>
        </header>
    );
}

// ─── Hero ──────────────────────────────────────────────────────────────────────

function KanbanMockup() {
    const cols = [
        { label: 'Ideia', color: '#A8A3C7', cards: ['Teste de onboarding in-app', 'Segmentação por ICP'] },
        { label: 'Em Execução', color: '#1AD3C5', cards: ['Email de ativação D+3', 'A/B copy pricing page'] },
        { label: 'Concluído', color: '#6B4FE8', cards: ['Checkout 1-click', 'NPS trigger pós-ativação'] },
    ];

    return (
        <div style={{
            background: 'rgba(45,27,107,0.25)',
            border: '1px solid rgba(107,79,232,0.3)',
            borderRadius: '16px',
            padding: '20px',
            backdropFilter: 'blur(8px)',
        }}>
            {/* Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444', opacity: 0.7 }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F59E0B', opacity: 0.7 }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#1AD3C5', opacity: 0.7 }} />
                <span style={{ marginLeft: '8px', fontSize: '11px', color: 'var(--velox-mist)', fontFamily: 'var(--font-data)' }}>
                    velox / experiments
                </span>
            </div>

            {/* Columns */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {cols.map(col => (
                    <div key={col.label}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: col.color }} />
                            <span style={{ fontSize: '11px', fontWeight: 600, color: col.color, fontFamily: 'var(--font-ui)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                {col.label}
                            </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {col.cards.map(card => (
                                <div
                                    key={card}
                                    style={{
                                        background: 'rgba(15,14,26,0.6)',
                                        border: '1px solid rgba(107,79,232,0.2)',
                                        borderRadius: '8px',
                                        padding: '10px 12px',
                                        fontSize: '11px',
                                        color: '#F8F7FC',
                                        fontFamily: 'var(--font-ui)',
                                        lineHeight: 1.4,
                                    }}
                                >
                                    {card}
                                    <div style={{ marginTop: '6px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                        <span style={{
                                            fontSize: '9px',
                                            background: 'rgba(107,79,232,0.25)',
                                            color: '#6B4FE8',
                                            borderRadius: '4px',
                                            padding: '1px 5px',
                                            fontFamily: 'var(--font-data)',
                                        }}>
                                            RICE: {(Math.random() * 50 + 20).toFixed(1)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Score summary */}
            <div style={{
                marginTop: '16px',
                padding: '10px 14px',
                background: 'rgba(26,211,197,0.08)',
                borderRadius: '8px',
                border: '1px solid rgba(26,211,197,0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
            }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1AD3C5', animation: 'pulse 2s infinite' }} />
                <span style={{ fontSize: '11px', color: '#1AD3C5', fontFamily: 'var(--font-data)' }}>
                    6 experimentos ativos · Win rate 67% · Avg 14 dias
                </span>
            </div>
        </div>
    );
}

function Hero() {
    return (
        <section style={{
            background: 'linear-gradient(180deg, #0F0E1A 0%, #120F22 60%, #0F0E1A 100%)',
            padding: '100px 24px 80px',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Ambient glow */}
            <div style={{
                position: 'absolute',
                top: '20%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '600px',
                height: '600px',
                background: 'radial-gradient(circle, rgba(107,79,232,0.15) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />
            <div style={{
                position: 'absolute',
                top: '40%',
                right: '10%',
                width: '300px',
                height: '300px',
                background: 'radial-gradient(circle, rgba(26,211,197,0.08) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />

            <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center', position: 'relative' }}>
                {/* Left */}
                <div>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'rgba(107,79,232,0.12)',
                        border: '1px solid rgba(107,79,232,0.3)',
                        borderRadius: '100px',
                        padding: '6px 14px',
                        marginBottom: '32px',
                    }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#1AD3C5' }} />
                        <span style={{ fontSize: '12px', color: 'var(--velox-mist)', fontFamily: 'var(--font-ui)', fontWeight: 500 }}>
                            O OS para times de growth
                        </span>
                    </div>

                    <h1 style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 800,
                        fontSize: 'clamp(40px, 5vw, 64px)',
                        lineHeight: 1.05,
                        letterSpacing: '-0.04em',
                        color: '#F8F7FC',
                        marginBottom: '24px',
                    }}>
                        Run growth.
                        <br />
                        <span style={{
                            background: 'linear-gradient(90deg, #6B4FE8 0%, #1AD3C5 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}>
                            Not chaos.
                        </span>
                    </h1>

                    <p style={{
                        fontFamily: 'var(--font-ui)',
                        fontSize: '18px',
                        lineHeight: 1.6,
                        color: 'var(--velox-mist)',
                        marginBottom: '40px',
                        maxWidth: '440px',
                    }}>
                        Priorize experimentos com ICE e RICE, monitore seu funil em tempo real,
                        e transforme cada aprendizado na próxima alavanca de crescimento.
                    </p>

                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <Link
                            href="/login"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: 'linear-gradient(135deg, #6B4FE8 0%, #1AD3C5 100%)',
                                color: '#F8F7FC',
                                padding: '14px 28px',
                                borderRadius: '10px',
                                fontFamily: 'var(--font-display)',
                                fontWeight: 700,
                                fontSize: '15px',
                                textDecoration: 'none',
                                letterSpacing: '-0.02em',
                            }}
                        >
                            Começar grátis
                            <span style={{ fontSize: '18px' }}>→</span>
                        </Link>
                        <a
                            href="#how-it-works"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                border: '1px solid rgba(107,79,232,0.4)',
                                color: 'var(--velox-mist)',
                                padding: '14px 28px',
                                borderRadius: '10px',
                                fontFamily: 'var(--font-ui)',
                                fontWeight: 500,
                                fontSize: '15px',
                                textDecoration: 'none',
                                background: 'transparent',
                            }}
                        >
                            Ver como funciona
                        </a>
                    </div>
                </div>

                {/* Right — Kanban Mockup */}
                <KanbanMockup />
            </div>
        </section>
    );
}

// ─── Stats Strip ──────────────────────────────────────────────────────────────

function StatsStrip() {
    const stats = [
        { value: '3×', label: 'mais experimentos por mês' },
        { value: '67%', label: 'win rate médio dos times' },
        { value: '−40%', label: 'tempo para priorizar' },
        { value: '12 sem', label: 'para ROI positivo' },
    ];

    return (
        <section style={{
            background: 'rgba(45,27,107,0.2)',
            borderTop: '1px solid rgba(107,79,232,0.15)',
            borderBottom: '1px solid rgba(107,79,232,0.15)',
            padding: '32px 24px',
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                {stats.map(s => (
                    <div key={s.label} style={{ textAlign: 'center' }}>
                        <div style={{
                            fontFamily: 'var(--font-display)',
                            fontWeight: 800,
                            fontSize: '36px',
                            letterSpacing: '-0.04em',
                            background: 'linear-gradient(90deg, #6B4FE8 0%, #1AD3C5 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}>
                            {s.value}
                        </div>
                        <div style={{
                            fontFamily: 'var(--font-ui)',
                            fontSize: '13px',
                            color: 'var(--velox-mist)',
                            marginTop: '4px',
                        }}>
                            {s.label}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

// ─── Problem ──────────────────────────────────────────────────────────────────

function Problem() {
    const pains = [
        { icon: '📊', text: 'Métricas espalhadas em 5 planilhas diferentes' },
        { icon: '🎲', text: 'Experimentos priorizados por achismo, não por dados' },
        { icon: '🧠', text: 'Aprendizados que morrem no Notion sem virar ação' },
        { icon: '🐌', text: 'Ciclos de teste longos e sem visibilidade de impacto' },
    ];

    return (
        <section style={{ padding: '100px 24px', background: '#0F0E1A' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
                <div>
                    <p style={{
                        fontFamily: 'var(--font-data)',
                        fontSize: '11px',
                        color: '#6B4FE8',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        marginBottom: '16px',
                    }}>
                        O problema
                    </p>
                    <h2 style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 800,
                        fontSize: 'clamp(32px, 4vw, 48px)',
                        lineHeight: 1.1,
                        letterSpacing: '-0.04em',
                        color: '#F8F7FC',
                        marginBottom: '24px',
                    }}>
                        Times de growth são rápidos.<br />
                        <span style={{ color: 'var(--velox-mist)' }}>Ferramentas deles, nem tanto.</span>
                    </h2>
                    <p style={{
                        fontFamily: 'var(--font-ui)',
                        fontSize: '16px',
                        lineHeight: 1.7,
                        color: 'var(--velox-mist)',
                    }}>
                        Você passa mais tempo organizando o que precisa testar do que testando de fato.
                        O Velox elimina esse atrito e coloca o foco onde importa: na execução.
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {pains.map(p => (
                        <div
                            key={p.text}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                padding: '16px 20px',
                                background: 'rgba(239,68,68,0.06)',
                                border: '1px solid rgba(239,68,68,0.2)',
                                borderRadius: '10px',
                            }}
                        >
                            <span style={{ fontSize: '20px' }}>{p.icon}</span>
                            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', color: '#F8F7FC' }}>
                                {p.text}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ─── Big Idea ─────────────────────────────────────────────────────────────────

function BigIdea() {
    return (
        <section style={{
            padding: '80px 24px',
            background: 'linear-gradient(135deg, rgba(45,27,107,0.4) 0%, rgba(15,14,26,0.8) 50%, rgba(26,211,197,0.06) 100%)',
            borderTop: '1px solid rgba(107,79,232,0.15)',
            borderBottom: '1px solid rgba(107,79,232,0.15)',
        }}>
            <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
                <p style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 800,
                    fontSize: 'clamp(28px, 4vw, 52px)',
                    lineHeight: 1.1,
                    letterSpacing: '-0.04em',
                    color: '#F8F7FC',
                    marginBottom: '24px',
                }}>
                    "O melhor time de growth não é o que tem mais ideias.
                    É o que executa{' '}
                    <span style={{
                        background: 'linear-gradient(90deg, #6B4FE8, #1AD3C5)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                    }}>
                        mais rápido
                    </span>
                    {' '}e aprende{' '}
                    <span style={{
                        background: 'linear-gradient(90deg, #1AD3C5, #6B4FE8)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                    }}>
                        mais sistematicamente
                    </span>."
                </p>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', color: 'var(--velox-mist)' }}>
                    Princípio central do Velox
                </p>
            </div>
        </section>
    );
}

// ─── Velocity Loop ────────────────────────────────────────────────────────────

function VelocityLoop() {
    const nodes = [
        { label: 'Priorizar', sublabel: 'ICE + RICE scoring', color: '#6B4FE8', x: 200, y: 60 },
        { label: 'Executar', sublabel: 'Kanban + Funil', color: '#1AD3C5', x: 380, y: 220 },
        { label: 'Aprender', sublabel: 'Learning log', color: '#F59E0B', x: 20, y: 220 },
    ];

    return (
        <section id="how-it-works" style={{ padding: '100px 24px', background: '#0F0E1A' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
                <p style={{
                    fontFamily: 'var(--font-data)',
                    fontSize: '11px',
                    color: '#1AD3C5',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    marginBottom: '16px',
                }}>
                    Como funciona
                </p>
                <h2 style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 800,
                    fontSize: 'clamp(28px, 4vw, 44px)',
                    letterSpacing: '-0.04em',
                    color: '#F8F7FC',
                    marginBottom: '16px',
                }}>
                    O loop de velocidade do Velox
                </h2>
                <p style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '16px',
                    color: 'var(--velox-mist)',
                    marginBottom: '64px',
                    maxWidth: '500px',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                }}>
                    Um ciclo contínuo que transforma caos em crescimento composto.
                </p>

                {/* SVG Diagram */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <svg width="440" height="320" viewBox="0 0 440 320" fill="none" style={{ maxWidth: '100%' }}>
                        <defs>
                            <marker id="arrow-pulse" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
                                <path d="M0,0 L0,8 L8,4 Z" fill="#6B4FE8" opacity="0.7" />
                            </marker>
                            <marker id="arrow-velocity" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
                                <path d="M0,0 L0,8 L8,4 Z" fill="#1AD3C5" opacity="0.7" />
                            </marker>
                            <marker id="arrow-insight" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
                                <path d="M0,0 L0,8 L8,4 Z" fill="#F59E0B" opacity="0.7" />
                            </marker>
                        </defs>

                        {/* Connecting arcs */}
                        <path d="M 240 90 Q 380 120 370 200" stroke="#6B4FE8" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.6" markerEnd="url(#arrow-pulse)" fill="none" />
                        <path d="M 350 240 Q 220 310 90 240" stroke="#1AD3C5" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.6" markerEnd="url(#arrow-velocity)" fill="none" />
                        <path d="M 55 200 Q 50 120 175 90" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.6" markerEnd="url(#arrow-insight)" fill="none" />

                        {/* Center label */}
                        <text x="220" y="166" textAnchor="middle" fill="#A8A3C7" fontSize="11" fontFamily="var(--font-data)" letterSpacing="0.08em">VELOX</text>
                        <text x="220" y="182" textAnchor="middle" fill="#A8A3C7" fontSize="9" fontFamily="var(--font-data)" opacity="0.6">LOOP</text>

                        {/* Nodes */}
                        {nodes.map(n => (
                            <g key={n.label}>
                                <circle cx={n.x + 60} cy={n.y + 30} r="44" fill={n.color} opacity="0.1" />
                                <circle cx={n.x + 60} cy={n.y + 30} r="36" fill={n.color} opacity="0.08" stroke={n.color} strokeWidth="1.5" strokeOpacity="0.5" />
                                <text x={n.x + 60} y={n.y + 26} textAnchor="middle" fill="#F8F7FC" fontSize="13" fontWeight="700" fontFamily="var(--font-display)">{n.label}</text>
                                <text x={n.x + 60} y={n.y + 42} textAnchor="middle" fill={n.color} fontSize="9" fontFamily="var(--font-data)">{n.sublabel}</text>
                            </g>
                        ))}
                    </svg>
                </div>
            </div>
        </section>
    );
}

// ─── Features ─────────────────────────────────────────────────────────────────

function FeatureMockup({ type }: { type: 'experiments' | 'funnels' | 'learnings' | 'velocity' }) {
    if (type === 'experiments') {
        return (
            <div style={{
                background: 'rgba(45,27,107,0.2)',
                border: '1px solid rgba(107,79,232,0.25)',
                borderRadius: '12px',
                padding: '20px',
                fontFamily: 'var(--font-data)',
            }}>
                <div style={{ fontSize: '10px', color: 'var(--velox-mist)', marginBottom: '12px', letterSpacing: '0.08em' }}>
                    BACKLOG — ordenado por RICE score
                </div>
                {[
                    { title: 'Email ativação D+3', stage: 'activation', score: 48.2, method: 'RICE' },
                    { title: 'Checkout 1-click', stage: 'revenue', score: 41.7, method: 'RICE' },
                    { title: 'NPS pós-feature', stage: 'retention', score: 36.0, method: 'ICE' },
                ].map((e, i) => (
                    <div key={e.title} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 12px',
                        background: 'rgba(15,14,26,0.6)',
                        borderRadius: '8px',
                        marginBottom: '8px',
                        border: `1px solid rgba(107,79,232,${0.3 - i * 0.08})`,
                    }}>
                        <span style={{
                            minWidth: '44px',
                            fontSize: '10px',
                            color: e.method === 'RICE' ? '#6B4FE8' : '#A8A3C7',
                            fontWeight: 600,
                        }}>
                            {e.score}
                        </span>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '12px', color: '#F8F7FC' }}>{e.title}</div>
                            <div style={{ fontSize: '9px', color: 'var(--velox-mist)', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{e.stage}</div>
                        </div>
                        <span style={{
                            fontSize: '9px',
                            background: e.method === 'RICE' ? 'rgba(107,79,232,0.2)' : 'rgba(168,163,199,0.2)',
                            color: e.method === 'RICE' ? '#6B4FE8' : '#A8A3C7',
                            padding: '2px 6px',
                            borderRadius: '4px',
                        }}>
                            {e.method}
                        </span>
                    </div>
                ))}
            </div>
        );
    }

    if (type === 'funnels') {
        const stages = [
            { name: 'Visitantes', value: 100, pct: 100 },
            { name: 'Cadastros', value: 38, pct: 38 },
            { name: 'Ativados', value: 21, pct: 21 },
            { name: 'Retidos', value: 14, pct: 14 },
            { name: 'Pagantes', value: 7, pct: 7 },
        ];
        const bottleneck = stages.reduce((maxIdx, s, i, arr) => {
            if (i === 0) return maxIdx;
            const drop = (arr[i - 1].pct - s.pct) / arr[i - 1].pct;
            const maxDrop = (arr[maxIdx - 1]?.pct - arr[maxIdx]?.pct) / (arr[maxIdx - 1]?.pct || 1);
            return drop > maxDrop ? i : maxIdx;
        }, 1);

        return (
            <div style={{ background: 'rgba(45,27,107,0.2)', border: '1px solid rgba(107,79,232,0.25)', borderRadius: '12px', padding: '20px' }}>
                <div style={{ fontSize: '10px', color: 'var(--velox-mist)', marginBottom: '12px', fontFamily: 'var(--font-data)', letterSpacing: '0.08em' }}>
                    FUNIL AARRR — último snapshot
                </div>
                {stages.map((s, i) => (
                    <div key={s.name} style={{ marginBottom: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '11px', color: i === bottleneck ? '#EF4444' : '#F8F7FC', fontFamily: 'var(--font-ui)' }}>
                                {s.name} {i === bottleneck && '⚠ gargalo'}
                            </span>
                            <span style={{ fontSize: '11px', color: 'var(--velox-mist)', fontFamily: 'var(--font-data)' }}>{s.pct}%</span>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                            <div style={{
                                height: '100%',
                                width: `${s.pct}%`,
                                background: i === bottleneck ? '#EF4444' : 'linear-gradient(90deg, #6B4FE8, #1AD3C5)',
                                borderRadius: '4px',
                                transition: 'width 0.3s',
                            }} />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (type === 'learnings') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                    { title: 'CTA "Começar agora" converte 22% mais', tag: 'copy', result: 'validated', impact: 'high' },
                    { title: 'Onboarding guiado reduz churn D7 em 18%', tag: 'onboarding', result: 'validated', impact: 'high' },
                    { title: 'Pop-up de NPS no D+3 não afeta retention', tag: 'ux', result: 'inconclusive', impact: 'medium' },
                ].map(l => (
                    <div key={l.title} style={{
                        background: 'rgba(45,27,107,0.2)',
                        border: '1px solid rgba(107,79,232,0.2)',
                        borderRadius: '10px',
                        padding: '14px 16px',
                    }}>
                        <div style={{ fontSize: '12px', color: '#F8F7FC', fontFamily: 'var(--font-ui)', marginBottom: '8px', lineHeight: 1.4 }}>
                            📌 {l.title}
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            <span style={{ fontSize: '9px', background: 'rgba(107,79,232,0.2)', color: '#6B4FE8', padding: '2px 6px', borderRadius: '4px', fontFamily: 'var(--font-data)' }}>
                                {l.tag}
                            </span>
                            <span style={{
                                fontSize: '9px',
                                background: l.result === 'validated' ? 'rgba(26,211,197,0.15)' : 'rgba(168,163,199,0.15)',
                                color: l.result === 'validated' ? '#1AD3C5' : '#A8A3C7',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontFamily: 'var(--font-data)',
                            }}>
                                {l.result}
                            </span>
                            <span style={{
                                fontSize: '9px',
                                background: l.impact === 'high' ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)',
                                color: l.impact === 'high' ? '#EF4444' : '#F59E0B',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontFamily: 'var(--font-data)',
                            }}>
                                {l.impact}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // velocity
    return (
        <div style={{ background: 'rgba(45,27,107,0.2)', border: '1px solid rgba(107,79,232,0.25)', borderRadius: '12px', padding: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                {[
                    { label: 'Em execução', value: '6', color: '#1AD3C5' },
                    { label: 'Win Rate', value: '67%', color: '#6B4FE8' },
                    { label: 'Concluídos 30d', value: '4', color: '#F59E0B' },
                    { label: 'Avg duração', value: '14d', color: '#A8A3C7' },
                ].map(k => (
                    <div key={k.label} style={{ background: 'rgba(15,14,26,0.5)', borderRadius: '8px', padding: '12px 14px' }}>
                        <div style={{ fontSize: '10px', color: 'var(--velox-mist)', fontFamily: 'var(--font-data)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                            {k.label}
                        </div>
                        <div style={{ fontSize: '22px', fontWeight: 700, color: k.color, fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}>
                            {k.value}
                        </div>
                    </div>
                ))}
            </div>
            {/* Mini bar chart */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '48px' }}>
                {[2, 3, 1, 4, 2, 5, 3, 6, 4, 3, 5, 4].map((v, i) => (
                    <div key={i} style={{ flex: 1, background: `rgba(107,79,232,${0.3 + v * 0.07})`, height: `${(v / 6) * 100}%`, borderRadius: '3px 3px 0 0' }} />
                ))}
            </div>
            <div style={{ fontSize: '9px', color: 'var(--velox-mist)', fontFamily: 'var(--font-data)', marginTop: '4px', textAlign: 'center', letterSpacing: '0.06em' }}>
                EXPERIMENTOS / SEMANA — 12 SEMANAS
            </div>
        </div>
    );
}

function Features() {
    const features = [
        {
            tag: 'Módulo 1',
            color: '#6B4FE8',
            title: 'Backlog com scoring automático',
            description: 'Chega de priorizar por feeling. O Velox calcula ICE e RICE automaticamente. Organize suas ideias em um kanban visual e saiba exatamente o que testar a seguir.',
            bullets: ['ICE Score = impacto × confiança × facilidade', 'RICE Score = alcance × impacto × confiança / esforço', 'Kanban com 5 colunas e ordenação automática'],
            mockup: 'experiments' as const,
        },
        {
            tag: 'Módulo 2',
            color: '#1AD3C5',
            title: 'Controle de funil em tempo real',
            description: 'Visualize cada etapa do seu AARRR, detecte gargalos automaticamente e acompanhe a evolução com snapshots históricos.',
            bullets: ['Funis customizáveis com stages livres', 'Detecção automática de gargalo com destaque visual', 'Comparação entre snapshots com delta percentual'],
            mockup: 'funnels' as const,
        },
        {
            tag: 'Módulo 3',
            color: '#F59E0B',
            title: 'Log de aprendizados que viram ação',
            description: 'Cada experimento gera um aprendizado. O Velox organiza, categoriza e torna pesquisáveis todos os insights do seu time.',
            bullets: ['Badges por impacto (alto/médio/baixo) e resultado', 'Busca full-text e filtros por categoria e funil', 'Aprendizados fixados para referência rápida'],
            mockup: 'learnings' as const,
        },
        {
            tag: 'Módulo 4',
            color: '#EF4444',
            title: 'Dashboard de velocidade',
            description: 'Meça a saúde operacional do seu processo de growth. Quantos experimentos estão rodando? Qual é o win rate? Qual time está mais veloz?',
            bullets: ['Win rate all-time e dos últimos 30 dias', 'Duração média de experimentos', 'Alerta de experimentos sem atualização'],
            mockup: 'velocity' as const,
        },
    ];

    return (
        <section id="features" style={{ padding: '80px 24px', background: '#0F0E1A' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '64px' }}>
                    <p style={{ fontFamily: 'var(--font-data)', fontSize: '11px', color: '#6B4FE8', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px' }}>
                        Tudo que você precisa
                    </p>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(28px, 4vw, 44px)', letterSpacing: '-0.04em', color: '#F8F7FC' }}>
                        4 módulos. 1 sistema.
                    </h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '80px' }}>
                    {features.map((f, i) => (
                        <div
                            key={f.tag}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: i % 2 === 0 ? '1fr 1fr' : '1fr 1fr',
                                gap: '64px',
                                alignItems: 'center',
                                direction: i % 2 !== 0 ? 'rtl' : 'ltr',
                            }}
                        >
                            <div style={{ direction: 'ltr' }}>
                                <div style={{
                                    display: 'inline-flex',
                                    padding: '4px 12px',
                                    background: `${f.color}18`,
                                    border: `1px solid ${f.color}40`,
                                    borderRadius: '100px',
                                    marginBottom: '16px',
                                }}>
                                    <span style={{ fontSize: '11px', color: f.color, fontFamily: 'var(--font-data)', letterSpacing: '0.08em' }}>
                                        {f.tag}
                                    </span>
                                </div>
                                <h3 style={{
                                    fontFamily: 'var(--font-display)',
                                    fontWeight: 700,
                                    fontSize: 'clamp(22px, 3vw, 32px)',
                                    letterSpacing: '-0.03em',
                                    color: '#F8F7FC',
                                    marginBottom: '16px',
                                    lineHeight: 1.2,
                                }}>
                                    {f.title}
                                </h3>
                                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '15px', lineHeight: 1.7, color: 'var(--velox-mist)', marginBottom: '24px' }}>
                                    {f.description}
                                </p>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {f.bullets.map(b => (
                                        <li key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                            <span style={{ color: f.color, fontSize: '14px', lineHeight: 1.5, flexShrink: 0 }}>→</span>
                                            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', color: '#F8F7FC', lineHeight: 1.5 }}>{b}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div style={{ direction: 'ltr' }}>
                                <FeatureMockup type={f.mockup} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ─── Before / After ────────────────────────────────────────────────────────────

function BeforeAfter() {
    const before = [
        'Planilhas desconexas por todo lado',
        'Priorização por feeling ou hierarquia',
        'Aprendizados que somem no Notion',
        'Ninguém sabe quantos testes estão rodando',
        'Post-mortem após fracasso, nunca antes',
    ];

    const after = [
        'Uma fonte única de verdade para growth',
        'Scoring automatizado com ICE e RICE',
        'Learning log ativo e pesquisável',
        'Dashboard de velocidade em tempo real',
        'Processo replicável que escala com o time',
    ];

    return (
        <section style={{ padding: '100px 24px', background: 'rgba(15,14,26,0.95)' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '56px' }}>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(28px, 4vw, 44px)', letterSpacing: '-0.04em', color: '#F8F7FC' }}>
                        Antes × Depois do Velox
                    </h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                    {/* Before */}
                    <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '16px', padding: '32px' }}>
                        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px', color: '#EF4444', marginBottom: '24px', letterSpacing: '-0.02em' }}>
                            😤 Antes
                        </p>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {before.map(b => (
                                <li key={b} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                    <span style={{ color: '#EF4444', flexShrink: 0 }}>✕</span>
                                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', color: 'var(--velox-mist)', lineHeight: 1.5 }}>{b}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* After */}
                    <div style={{ background: 'rgba(107,79,232,0.08)', border: '1px solid rgba(107,79,232,0.3)', borderRadius: '16px', padding: '32px' }}>
                        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px', color: '#1AD3C5', marginBottom: '24px', letterSpacing: '-0.02em' }}>
                            ✨ Com Velox
                        </p>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {after.map(a => (
                                <li key={a} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                    <span style={{ color: '#1AD3C5', flexShrink: 0 }}>→</span>
                                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', color: '#F8F7FC', lineHeight: 1.5 }}>{a}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}

// ─── CTA Final ────────────────────────────────────────────────────────────────

function CTAFinal() {
    return (
        <section style={{
            padding: '100px 24px',
            background: 'linear-gradient(135deg, rgba(45,27,107,0.6) 0%, rgba(15,14,26,0.9) 50%, rgba(26,211,197,0.1) 100%)',
            borderTop: '1px solid rgba(107,79,232,0.2)',
            textAlign: 'center',
        }}>
            <div style={{ maxWidth: '640px', margin: '0 auto' }}>
                <h2 style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 800,
                    fontSize: 'clamp(32px, 5vw, 56px)',
                    letterSpacing: '-0.04em',
                    color: '#F8F7FC',
                    lineHeight: 1.05,
                    marginBottom: '20px',
                }}>
                    Pronto para rodar growth{' '}
                    <span style={{
                        background: 'linear-gradient(90deg, #6B4FE8, #1AD3C5)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                    }}>
                        de verdade?
                    </span>
                </h2>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '17px', color: 'var(--velox-mist)', lineHeight: 1.6, marginBottom: '40px' }}>
                    Comece grátis. Configure seu primeiro experimento em menos de 5 minutos.
                    Sem cartão de crédito.
                </p>
                <Link
                    href="/login"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '10px',
                        background: 'linear-gradient(135deg, #6B4FE8 0%, #1AD3C5 100%)',
                        color: '#F8F7FC',
                        padding: '16px 36px',
                        borderRadius: '12px',
                        fontFamily: 'var(--font-display)',
                        fontWeight: 700,
                        fontSize: '16px',
                        textDecoration: 'none',
                        letterSpacing: '-0.02em',
                    }}
                >
                    Começar grátis
                    <span style={{ fontSize: '20px' }}>→</span>
                </Link>
            </div>
        </section>
    );
}

// ─── Footer ──────────────────────────────────────────────────────────────────

function Footer() {
    return (
        <footer style={{
            background: '#0F0E1A',
            borderTop: '1px solid rgba(107,79,232,0.12)',
            padding: '40px 24px',
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <defs>
                            <linearGradient id="footer-mark" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#2D1B6B" />
                                <stop offset="50%" stopColor="#6B4FE8" />
                                <stop offset="100%" stopColor="#1AD3C5" />
                            </linearGradient>
                        </defs>
                        <path d="M4 4 L12 20 L20 4 L16 4 L12 12 L8 4 Z" fill="url(#footer-mark)" />
                    </svg>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', color: '#F8F7FC', letterSpacing: '-0.02em' }}>
                        velox<span style={{ color: '#1AD3C5', fontStyle: 'italic' }}>x</span>
                    </span>
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--velox-mist)', marginLeft: '8px' }}>
                        Run growth. Not chaos.
                    </span>
                </div>

                <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                    <Link href="/login" style={{ fontSize: '13px', color: 'var(--velox-mist)', textDecoration: 'none', fontFamily: 'var(--font-ui)' }}>
                        Login
                    </Link>
                    <Link href="/dashboard" style={{ fontSize: '13px', color: 'var(--velox-mist)', textDecoration: 'none', fontFamily: 'var(--font-ui)' }}>
                        Dashboard
                    </Link>
                    <span style={{ fontSize: '12px', color: 'rgba(168,163,199,0.4)', fontFamily: 'var(--font-ui)' }}>
                        © {new Date().getFullYear()} Velox
                    </span>
                </div>
            </div>
        </footer>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
    return (
        <div style={{ background: '#0F0E1A', minHeight: '100vh', color: '#F8F7FC' }}>
            <Nav />
            <Hero />
            <StatsStrip />
            <Problem />
            <BigIdea />
            <VelocityLoop />
            <Features />
            <BeforeAfter />
            <CTAFinal />
            <Footer />
        </div>
    );
}
