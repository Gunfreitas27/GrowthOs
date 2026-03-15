import Link from 'next/link'

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div
            style={{
                minHeight: '100vh',
                background: '#0F0E1A',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Ambient orb — esquerda/topo */}
            <div
                style={{
                    position: 'absolute',
                    top: '-15%',
                    left: '-10%',
                    width: '640px',
                    height: '640px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(107,79,232,0.13) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }}
            />
            {/* Ambient orb — direita/baixo */}
            <div
                style={{
                    position: 'absolute',
                    bottom: '-20%',
                    right: '-10%',
                    width: '520px',
                    height: '520px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(26,211,197,0.09) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }}
            />
            {/* Grid sutil */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage:
                        'linear-gradient(rgba(107,79,232,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(107,79,232,0.04) 1px, transparent 1px)',
                    backgroundSize: '48px 48px',
                    pointerEvents: 'none',
                }}
            />

            {/* Logo */}
            <Link
                href="/"
                style={{
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '40px',
                    position: 'relative',
                    zIndex: 1,
                }}
            >
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                    <defs>
                        <linearGradient id="auth-logo" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#2D1B6B" />
                            <stop offset="50%" stopColor="#6B4FE8" />
                            <stop offset="100%" stopColor="#1AD3C5" />
                        </linearGradient>
                    </defs>
                    <path d="M4 4 L12 20 L20 4 L16 4 L12 12 L8 4 Z" fill="url(#auth-logo)" />
                </svg>
                <span
                    style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 700,
                        fontSize: '22px',
                        letterSpacing: '-0.03em',
                        color: '#F8F7FC',
                    }}
                >
                    velox
                    <span style={{ color: '#1AD3C5', fontStyle: 'italic' }}>x</span>
                </span>
            </Link>

            {/* Conteúdo (Login / Signup card) */}
            <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>
                {children}
            </div>

            {/* Rodapé discreto */}
            <p
                style={{
                    position: 'relative',
                    zIndex: 1,
                    marginTop: '40px',
                    fontFamily: 'var(--font-ui)',
                    fontSize: '12px',
                    color: 'rgba(168,163,199,0.4)',
                    letterSpacing: '0.04em',
                }}
            >
                Cresça com método. Não com caos.
            </p>
        </div>
    )
}
