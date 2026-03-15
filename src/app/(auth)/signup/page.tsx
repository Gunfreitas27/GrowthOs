'use client'

import { registerUser } from '@/lib/actions'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

/* ─── Estilos compartilhados ─────────────────────────────────────────────── */

const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-ui)',
    fontSize: '11px',
    fontWeight: 500,
    letterSpacing: '0.07em',
    textTransform: 'uppercase',
    color: 'var(--velox-mist)',
    display: 'block',
    marginBottom: '8px',
}

const inputStyle: React.CSSProperties = {
    background: 'rgba(107,79,232,0.07)',
    border: '1px solid rgba(107,79,232,0.22)',
    borderRadius: '8px',
    color: '#F8F7FC',
    fontFamily: 'var(--font-ui)',
    fontSize: '14px',
    transition: 'border-color 0.15s ease',
}

/* ─── Botão de submit ─────────────────────────────────────────────────────── */

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <button
            type="submit"
            disabled={pending}
            style={{
                width: '100%',
                background: pending
                    ? 'rgba(107,79,232,0.5)'
                    : 'linear-gradient(135deg, #6B4FE8 0%, #1AD3C5 100%)',
                border: 'none',
                borderRadius: '8px',
                padding: '13px 20px',
                fontFamily: 'var(--font-ui)',
                fontWeight: 600,
                fontSize: '14px',
                letterSpacing: '-0.01em',
                color: '#F8F7FC',
                cursor: pending ? 'not-allowed' : 'pointer',
                transition: 'opacity 0.15s ease',
                marginTop: '4px',
            }}
        >
            {pending ? 'Criando conta...' : 'Criar conta →'}
        </button>
    )
}

/* ─── Página ──────────────────────────────────────────────────────────────── */

export default function SignupPage() {
    const [errorMessage, dispatch] = useActionState(registerUser, undefined)

    return (
        <div
            style={{
                background: 'rgba(26,24,46,0.75)',
                border: '1px solid rgba(107,79,232,0.2)',
                borderRadius: '16px',
                padding: '40px',
                backdropFilter: 'blur(18px)',
                WebkitBackdropFilter: 'blur(18px)',
                boxShadow: '0 24px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
            }}
        >
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <h1
                    style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 800,
                        fontSize: '26px',
                        letterSpacing: '-0.03em',
                        color: '#F8F7FC',
                        marginBottom: '8px',
                    }}
                >
                    Crie sua conta
                </h1>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', color: 'var(--velox-mist)' }}>
                    Comece a usar o Velox gratuitamente hoje
                </p>
            </div>

            {/* Form */}
            <form action={dispatch} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                    <label htmlFor="name" style={labelStyle}>Nome completo</label>
                    <Input
                        id="name"
                        name="name"
                        placeholder="João Silva"
                        required
                        minLength={2}
                        style={inputStyle}
                    />
                </div>

                <div>
                    <label htmlFor="email" style={labelStyle}>E-mail</label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="nome@empresa.com"
                        required
                        style={inputStyle}
                    />
                </div>

                <div>
                    <label htmlFor="password" style={labelStyle}>Senha</label>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        required
                        minLength={6}
                        style={inputStyle}
                    />
                    <p
                        style={{
                            fontFamily: 'var(--font-ui)',
                            fontSize: '11px',
                            color: 'rgba(168,163,199,0.6)',
                            marginTop: '6px',
                        }}
                    >
                        Mínimo de 6 caracteres
                    </p>
                </div>

                {errorMessage && (
                    <div
                        style={{
                            background: 'rgba(239,68,68,0.1)',
                            border: '1px solid rgba(239,68,68,0.3)',
                            borderRadius: '8px',
                            padding: '10px 14px',
                            fontFamily: 'var(--font-ui)',
                            fontSize: '13px',
                            color: '#EF4444',
                        }}
                    >
                        {errorMessage}
                    </div>
                )}

                <SubmitButton />
            </form>

            {/* Rodapé do card */}
            <div
                style={{
                    marginTop: '28px',
                    paddingTop: '24px',
                    borderTop: '1px solid rgba(107,79,232,0.12)',
                    textAlign: 'center',
                    fontFamily: 'var(--font-ui)',
                    fontSize: '13px',
                    color: 'var(--velox-mist)',
                }}
            >
                Já tem uma conta?{' '}
                <Link
                    href="/login"
                    style={{ color: 'var(--velox-velocity)', textDecoration: 'none', fontWeight: 600 }}
                >
                    Entrar
                </Link>
            </div>
        </div>
    )
}
