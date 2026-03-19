'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, Calendar, Crown, ShieldCheck, Pencil, Eye } from 'lucide-react';

type Org = {
    id: string;
    name: string;
    plan: string;
    createdAt: Date;
} | null;

type Member = {
    id: string;
    name: string | null;
    email: string;
    role: string;
    createdAt: Date;
};

const ROLE_LABELS: Record<string, string> = {
    OWNER: 'Owner',
    ADMIN: 'Admin',
    EDITOR: 'Editor',
    VIEWER: 'Viewer',
    USER: 'Membro',
};

const ROLE_ICONS: Record<string, React.ElementType> = {
    OWNER: Crown,
    ADMIN: ShieldCheck,
    EDITOR: Pencil,
    VIEWER: Eye,
    USER: Users,
};

const ROLE_COLORS: Record<string, string> = {
    OWNER: 'bg-yellow-100 text-yellow-800',
    ADMIN: 'bg-purple-100 text-purple-800',
    EDITOR: 'bg-blue-100 text-blue-800',
    VIEWER: 'bg-gray-100 text-gray-700',
    USER: 'bg-gray-100 text-gray-700',
};

const PLAN_LABELS: Record<string, string> = {
    FREE: 'Free',
    PRO: 'Pro',
    ENTERPRISE: 'Enterprise',
};

const PLAN_COLORS: Record<string, string> = {
    FREE: 'bg-gray-100 text-gray-700',
    PRO: 'bg-purple-100 text-purple-800',
    ENTERPRISE: 'bg-emerald-100 text-emerald-800',
};

function formatDate(date: Date) {
    return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function UserInitials({ name, email }: { name: string | null; email: string }) {
    const display = name ?? email;
    const parts = display.trim().split(' ');
    const initials = parts.length >= 2
        ? `${parts[0][0]}${parts[parts.length - 1][0]}`
        : parts[0].slice(0, 2);
    return <>{initials.toUpperCase()}</>;
}

export default function SettingsView({
    org,
    members,
    currentUserId,
}: {
    org: Org;
    members: Member[];
    currentUserId: string;
}) {
    return (
        <div className="space-y-8 max-w-3xl">
            {/* Organization Info */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: 'rgba(107, 79, 232, 0.12)' }}
                        >
                            <Building2 className="w-5 h-5" style={{ color: 'var(--velox-pulse)' }} />
                        </div>
                        <div>
                            <CardTitle>Organização</CardTitle>
                            <CardDescription>Detalhes do workspace atual</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--velox-mist)' }}>NOME</p>
                            <p className="text-sm font-medium">{org?.name ?? '—'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--velox-mist)' }}>PLANO</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PLAN_COLORS[org?.plan ?? 'FREE']}`}>
                                {PLAN_LABELS[org?.plan ?? 'FREE']}
                            </span>
                        </div>
                        <div>
                            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--velox-mist)' }}>MEMBROS</p>
                            <p className="text-sm font-medium">{members.length}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--velox-mist)' }}>CRIADO EM</p>
                            <p className="text-sm font-medium">{org ? formatDate(org.createdAt) : '—'}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Team Members */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: 'rgba(107, 79, 232, 0.12)' }}
                        >
                            <Users className="w-5 h-5" style={{ color: 'var(--velox-pulse)' }} />
                        </div>
                        <div>
                            <CardTitle>Membros do Time</CardTitle>
                            <CardDescription>{members.length} membro{members.length !== 1 ? 's' : ''} na organização</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {members.map(member => {
                            const RoleIcon = ROLE_ICONS[member.role] ?? Users;
                            const isCurrentUser = member.id === currentUserId;
                            return (
                                <div
                                    key={member.id}
                                    className="flex items-center gap-3 p-3 rounded-lg"
                                    style={{ background: isCurrentUser ? 'rgba(107, 79, 232, 0.06)' : '#F9FAFB' }}
                                >
                                    {/* Avatar */}
                                    <div
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                                        style={{ background: 'rgba(107, 79, 232, 0.15)', color: 'var(--velox-pulse)' }}
                                    >
                                        <UserInitials name={member.name} email={member.email} />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium truncate">
                                                {member.name ?? member.email}
                                            </p>
                                            {isCurrentUser && (
                                                <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(107, 79, 232, 0.12)', color: 'var(--velox-pulse)' }}>
                                                    você
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs truncate" style={{ color: 'var(--velox-mist)' }}>
                                            {member.email}
                                        </p>
                                    </div>

                                    {/* Role + Date */}
                                    <div className="flex items-center gap-3 shrink-0">
                                        <p className="text-xs hidden sm:block" style={{ color: 'var(--velox-mist)' }}>
                                            desde {formatDate(member.createdAt)}
                                        </p>
                                        <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[member.role] ?? 'bg-gray-100 text-gray-700'}`}>
                                            <RoleIcon className="w-3 h-3" />
                                            {ROLE_LABELS[member.role] ?? member.role}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Growth Tips */}
            <Card style={{ borderColor: 'rgba(107, 79, 232, 0.2)', background: 'rgba(107, 79, 232, 0.04)' }}>
                <CardHeader>
                    <CardTitle className="text-base">Dicas para times de growth</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2 text-sm" style={{ color: 'var(--velox-mist)' }}>
                        <li className="flex items-start gap-2">
                            <span style={{ color: 'var(--velox-pulse)' }}>→</span>
                            Mantenha no máximo 3 experimentos <strong className="text-foreground">em andamento</strong> por pessoa.
                        </li>
                        <li className="flex items-start gap-2">
                            <span style={{ color: 'var(--velox-pulse)' }}>→</span>
                            Registre <strong className="text-foreground">aprendizados</strong> imediatamente após concluir cada experimento.
                        </li>
                        <li className="flex items-start gap-2">
                            <span style={{ color: 'var(--velox-pulse)' }}>→</span>
                            Use a página de <strong className="text-foreground">Velocidade</strong> para revisão semanal de cadência.
                        </li>
                        <li className="flex items-start gap-2">
                            <span style={{ color: 'var(--velox-pulse)' }}>→</span>
                            Rode o <strong className="text-foreground">Diagnóstico de Funil</strong> ao menos uma vez por mês.
                        </li>
                        <li className="flex items-start gap-2">
                            <span style={{ color: 'var(--velox-pulse)' }}>→</span>
                            Priorize o backlog pelo <strong className="text-foreground">score RICE</strong> antes de iniciar novos ciclos.
                        </li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
