const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

function daysAgo(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d;
}

function weeksAgo(n) {
    return daysAgo(n * 7);
}

async function main() {
    console.log('🌱 Seeding database...');

    // ─── Organization ─────────────────────────────────────────────────────────
    const org = await prisma.organization.upsert({
        where: { id: 'test-org-id' },
        update: {},
        create: {
            id: 'test-org-id',
            name: 'Test Organization',
            plan: 'FREE',
        },
    });
    console.log('✅ Organization:', org.name);

    // ─── User ─────────────────────────────────────────────────────────────────
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await prisma.user.upsert({
        where: { email: 'test@example.com' },
        update: {},
        create: {
            email: 'test@example.com',
            name: 'Test User',
            passwordHash: hashedPassword,
            role: 'OWNER',
            organizationId: org.id,
        },
    });
    console.log('✅ User:', user.email);

    // ─── Experiments ──────────────────────────────────────────────────────────
    const experimentsData = [
        // COMPLETED — WINS
        {
            id: 'exp-001',
            title: 'Reescrever headline da homepage com proposta de valor direta',
            hypothesis: 'Acreditamos que uma headline mais direta aumentará a taxa de signup em 15%',
            funnelStage: 'acquisition',
            status: 'completed',
            result: 'win',
            iceImpact: 8, iceConfidence: 7, iceEase: 9,
            expectedLift: 15, actualLift: 18.2,
            tags: JSON.stringify(['copy', 'homepage', 'cta']),
            learning: 'Especificidade supera inteligência. "Aumente sua taxa de conversão em 30 dias" converteu 18% mais que o headline genérico.',
            createdAt: weeksAgo(11), startedAt: weeksAgo(10), endedAt: weeksAgo(9),
        },
        {
            id: 'exp-002',
            title: 'Simplificar fluxo de onboarding: remover 3 etapas',
            hypothesis: 'Reduzir fricção no onboarding aumentará a ativação em 20%',
            funnelStage: 'activation',
            status: 'completed',
            result: 'win',
            riceReach: 500, riceImpact: 3, riceConfidence: 80, riceEffort: 2,
            expectedLift: 20, actualLift: 24.1,
            tags: JSON.stringify(['onboarding', 'ux', 'activation']),
            learning: 'Cada etapa removida do onboarding aumentou a ativação em ~8%. Menos é mais.',
            createdAt: weeksAgo(10), startedAt: weeksAgo(9), endedAt: weeksAgo(7),
        },
        {
            id: 'exp-003',
            title: 'Adicionar social proof na página de planos',
            hypothesis: 'Depoimentos de clientes na página de pricing aumentarão conversão para plano pago',
            funnelStage: 'revenue',
            status: 'completed',
            result: 'win',
            iceImpact: 7, iceConfidence: 8, iceEase: 8,
            expectedLift: 10, actualLift: 12.5,
            tags: JSON.stringify(['social-proof', 'pricing', 'revenue']),
            learning: 'Social proof específico (nome + empresa + resultado quantificado) teve 2x mais impacto que depoimentos genéricos.',
            createdAt: weeksAgo(9), startedAt: weeksAgo(8), endedAt: weeksAgo(6),
        },
        // COMPLETED — LOSSES
        {
            id: 'exp-004',
            title: 'Gamificação com badges no onboarding',
            hypothesis: 'Badges de progresso aumentarão engajamento e conclusão do onboarding',
            funnelStage: 'activation',
            status: 'completed',
            result: 'loss',
            iceImpact: 6, iceConfidence: 5, iceEase: 4,
            expectedLift: 12, actualLift: -3.1,
            tags: JSON.stringify(['gamification', 'onboarding']),
            learning: 'Gamificação adicionou complexidade sem valor percebido. Usuários ignoraram os badges e sentiram o fluxo mais lento.',
            createdAt: weeksAgo(8), startedAt: weeksAgo(7), endedAt: weeksAgo(5),
        },
        {
            id: 'exp-005',
            title: 'Pop-up de exit intent com desconto de 20%',
            hypothesis: 'Oferecer desconto para visitantes que tentam sair converterá mais trials',
            funnelStage: 'acquisition',
            status: 'completed',
            result: 'loss',
            iceImpact: 7, iceConfidence: 4, iceEase: 7,
            expectedLift: 8, actualLift: -1.2,
            tags: JSON.stringify(['discount', 'exit-intent', 'acquisition']),
            learning: 'Pop-ups de exit intent deterioraram a experiência. Taxa de bounce aumentou. Desconto desvalorizou o produto.',
            createdAt: weeksAgo(7), startedAt: weeksAgo(6), endedAt: weeksAgo(4),
        },
        {
            id: 'exp-006',
            title: 'Email de retenção D+7 com feature highlight',
            hypothesis: 'Email educativo no D+7 aumentará uso semanal e retenção',
            funnelStage: 'retention',
            status: 'completed',
            result: 'loss',
            riceReach: 300, riceImpact: 2, riceConfidence: 60, riceEffort: 1,
            expectedLift: 5, actualLift: 0.8,
            tags: JSON.stringify(['email', 'retention', 'd7']),
            learning: 'Email de feature highlight não engajou porque usuários já haviam churnado antes do D+7. Testar D+3.',
            createdAt: weeksAgo(6), startedAt: weeksAgo(5), endedAt: weeksAgo(3),
        },
        // COMPLETED — INCONCLUSIVE
        {
            id: 'exp-007',
            title: 'Mudar cor do botão de CTA para laranja',
            hypothesis: 'Botão laranja terá maior contraste e aumentará cliques',
            funnelStage: 'acquisition',
            status: 'completed',
            result: 'inconclusive',
            iceImpact: 4, iceConfidence: 5, iceEase: 10,
            expectedLift: 5, actualLift: 1.1,
            tags: JSON.stringify(['button', 'cta', 'ux']),
            learning: 'Diferença estatisticamente não significativa. Necessário maior volume de tráfego ou teste mais longo.',
            createdAt: weeksAgo(5), startedAt: weeksAgo(4), endedAt: weeksAgo(2),
        },
        {
            id: 'exp-008',
            title: 'Adicionar live chat no trial para reduzir churn',
            hypothesis: 'Suporte proativo durante trial aumentará ativação',
            funnelStage: 'activation',
            status: 'completed',
            result: 'inconclusive',
            riceReach: 150, riceImpact: 3, riceConfidence: 55, riceEffort: 3,
            expectedLift: 15, actualLift: 4.2,
            tags: JSON.stringify(['chat', 'support', 'trial']),
            learning: 'Impacto positivo mas alto custo operacional. ROI questionável para o volume atual. Retestar em escala.',
            createdAt: weeksAgo(4), startedAt: weeksAgo(3), endedAt: daysAgo(10),
        },
        // IN PROGRESS
        {
            id: 'exp-009',
            title: 'Teste A/B de preços: anual com desconto de 40% vs 30%',
            hypothesis: 'Desconto maior no anual aumentará conversão para plano anual em 25%',
            funnelStage: 'revenue',
            status: 'in_progress',
            riceReach: 400, riceImpact: 3, riceConfidence: 75, riceEffort: 2,
            expectedLift: 25,
            tags: JSON.stringify(['pricing', 'annual', 'revenue']),
            createdAt: weeksAgo(3), startedAt: weeksAgo(2),
        },
        {
            id: 'exp-010',
            title: 'Onboarding personalizado por segmento (PME vs Enterprise)',
            hypothesis: 'Onboarding específico por perfil aumentará ativação em 30%',
            funnelStage: 'activation',
            status: 'in_progress',
            iceImpact: 9, iceConfidence: 7, iceEase: 5,
            expectedLift: 30,
            tags: JSON.stringify(['onboarding', 'personalization', 'segmentation']),
            createdAt: weeksAgo(3), startedAt: weeksAgo(2),
        },
        // STALE (in_progress, updated >30 days ago) — para aparecer na lista de atenção
        {
            id: 'exp-011',
            title: 'Programa de referral com recompensa dupla',
            hypothesis: 'Referral bônus duplo (quem indica e quem é indicado) aumentará indicações',
            funnelStage: 'referral',
            status: 'in_progress',
            iceImpact: 8, iceConfidence: 6, iceEase: 4,
            expectedLift: 40,
            tags: JSON.stringify(['referral', 'viral', 'growth']),
            createdAt: weeksAgo(8), startedAt: weeksAgo(7),
        },
        // BACKLOG
        {
            id: 'exp-012',
            title: 'Notificações push para reengajamento D+14',
            hypothesis: 'Push no D+14 reengajará usuários inativos e reduzirá churn em 8%',
            funnelStage: 'retention',
            status: 'backlog',
            iceImpact: 7, iceConfidence: 6, iceEase: 6,
            expectedLift: 8,
            tags: JSON.stringify(['push', 'retention', 'reengagement']),
            createdAt: weeksAgo(5),
        },
        {
            id: 'exp-013',
            title: 'Landing page específica por canal de aquisição (Google vs LinkedIn)',
            hypothesis: 'Landing pages específicas por canal aumentarão conversão em 20%',
            funnelStage: 'acquisition',
            status: 'backlog',
            riceReach: 600, riceImpact: 2, riceConfidence: 70, riceEffort: 3,
            expectedLift: 20,
            tags: JSON.stringify(['landing-page', 'channel', 'acquisition']),
            createdAt: weeksAgo(4),
        },
        // IDEAS
        {
            id: 'exp-014',
            title: 'Programa de fidelidade com pontos acumuláveis',
            hypothesis: 'Pontos de fidelidade aumentarão LTV em 15%',
            funnelStage: 'revenue',
            status: 'idea',
            iceImpact: 7, iceConfidence: 5, iceEase: 3,
            tags: JSON.stringify(['loyalty', 'ltv', 'revenue']),
            createdAt: weeksAgo(2),
        },
        {
            id: 'exp-015',
            title: 'Widget de ROI calculator na homepage',
            hypothesis: 'Calculator interativo aumentará intenção de compra',
            funnelStage: 'awareness',
            status: 'idea',
            iceImpact: 6, iceConfidence: 5, iceEase: 7,
            tags: JSON.stringify(['calculator', 'awareness', 'conversion']),
            createdAt: weeksAgo(1),
        },
    ];

    for (const exp of experimentsData) {
        const { id, createdAt, startedAt, endedAt, ...rest } = exp;

        // Calculate priorityScore
        let priorityScore = null;
        const { riceReach, riceImpact, riceConfidence, riceEffort, iceImpact, iceConfidence, iceEase } = rest;
        if (riceReach != null && riceImpact != null && riceConfidence != null && riceEffort != null) {
            priorityScore = (riceReach * riceImpact * (riceConfidence / 100)) / riceEffort;
        } else if (iceImpact != null && iceConfidence != null && iceEase != null) {
            priorityScore = (iceImpact + iceConfidence + iceEase) / 3;
        }

        await prisma.experiment.upsert({
            where: { id },
            update: {},
            create: {
                id,
                ...rest,
                priorityScore,
                organizationId: org.id,
                ownerId: user.id,
                createdAt,
                startedAt: startedAt ?? null,
                endedAt: endedAt ?? null,
                // Force updatedAt for stale experiment
                ...(id === 'exp-011' ? {} : {}),
            },
        });

        // Manually update updatedAt for stale experiment
        if (id === 'exp-011') {
            await prisma.experiment.update({
                where: { id },
                data: { updatedAt: daysAgo(45) },
            });
        }
    }
    console.log(`✅ Created ${experimentsData.length} experiments`);

    // ─── Funnel ───────────────────────────────────────────────────────────────
    const funnel = await prisma.funnel.upsert({
        where: { id: 'funnel-001' },
        update: {},
        create: {
            id: 'funnel-001',
            name: 'Funil Principal de Conversão',
            description: 'Do visitante ao cliente pagante',
            organizationId: org.id,
            stages: JSON.stringify([
                { name: 'Visitantes', order: 0 },
                { name: 'Leads', order: 1 },
                { name: 'Trials', order: 2 },
                { name: 'Ativados', order: 3 },
                { name: 'Pagantes', order: 4 },
            ]),
        },
    });

    // Snapshots
    const snapshots = [
        {
            id: 'snap-001',
            snapshotDate: weeksAgo(8),
            stageData: JSON.stringify([
                { stageName: 'Visitantes', value: 10000 },
                { stageName: 'Leads', value: 1200 },
                { stageName: 'Trials', value: 340 },
                { stageName: 'Ativados', value: 180 },
                { stageName: 'Pagantes', value: 72 },
            ]),
            notes: 'Baseline — início do trimestre',
        },
        {
            id: 'snap-002',
            snapshotDate: weeksAgo(4),
            stageData: JSON.stringify([
                { stageName: 'Visitantes', value: 11500 },
                { stageName: 'Leads', value: 1450 },
                { stageName: 'Trials', value: 390 },
                { stageName: 'Ativados', value: 195 },
                { stageName: 'Pagantes', value: 82 },
            ]),
            notes: 'Após otimização da homepage (+18% signups)',
        },
        {
            id: 'snap-003',
            snapshotDate: daysAgo(3),
            stageData: JSON.stringify([
                { stageName: 'Visitantes', value: 12800 },
                { stageName: 'Leads', value: 1680 },
                { stageName: 'Trials', value: 440 },
                { stageName: 'Ativados', value: 230 },
                { stageName: 'Pagantes', value: 97 },
            ]),
            notes: 'Após simplificação do onboarding',
        },
    ];

    for (const snap of snapshots) {
        await prisma.funnelSnapshot.upsert({
            where: { id: snap.id },
            update: {},
            create: {
                ...snap,
                funnelId: funnel.id,
                createdById: user.id,
            },
        });
    }
    console.log('✅ Created funnel with 3 snapshots');

    // Link experiments to funnel
    await prisma.funnelStageLink.upsert({
        where: { funnelId_experimentId: { funnelId: funnel.id, experimentId: 'exp-001' } },
        update: {},
        create: { funnelId: funnel.id, experimentId: 'exp-001', stageName: 'Leads' },
    });
    await prisma.funnelStageLink.upsert({
        where: { funnelId_experimentId: { funnelId: funnel.id, experimentId: 'exp-009' } },
        update: {},
        create: { funnelId: funnel.id, experimentId: 'exp-009', stageName: 'Pagantes' },
    });

    // ─── Learnings ────────────────────────────────────────────────────────────
    const learningsData = [
        {
            id: 'learn-001',
            title: 'Copy direto e específico supera copy criativo',
            summary: 'Headlines com benefício quantificado ("aumente em X%") consistentemente superam headlines criativos e metafóricos.',
            category: 'copy',
            funnelStage: 'acquisition',
            impactLevel: 'high',
            resultType: 'validated',
            evidence: 'Testado em 5 experimentos distintos. Melhora média de 15-20% na taxa de clique.',
            recommendation: 'Usar sempre o framework "Verbo + Benefício + Quantificado" nos principais CTAs e headlines.',
            tags: JSON.stringify(['copy', 'cta', 'headline']),
            isPinned: true,
            experimentId: 'exp-001',
        },
        {
            id: 'learn-002',
            title: 'Cada etapa de onboarding removida vale ~8% de ativação',
            summary: 'Experimento de simplificação do onboarding mostrou correlação direta: menos etapas = mais ativação.',
            category: 'onboarding',
            funnelStage: 'activation',
            impactLevel: 'high',
            resultType: 'validated',
            evidence: 'Remoção de 3 etapas → +24% ativação. Remoção de 1 etapa → +8%. Correlação linear.',
            recommendation: 'Questionar cada campo/etapa do onboarding. Default: não incluir a menos que seja essencial.',
            tags: JSON.stringify(['onboarding', 'friction', 'activation']),
            isPinned: true,
            experimentId: 'exp-002',
        },
        {
            id: 'learn-003',
            title: 'Social proof específico tem 2x impacto vs genérico',
            summary: 'Depoimentos com nome real + empresa + resultado quantificado convertem 2x mais que depoimentos genéricos.',
            category: 'copy',
            funnelStage: 'revenue',
            impactLevel: 'medium',
            resultType: 'validated',
            evidence: '"João Silva, CEO da Empresa X, aumentou revenue em 30%" vs "Excelente produto, recomendo" → 2x diferença.',
            recommendation: 'Sempre coletar depoimentos com estrutura: persona + contexto + resultado numérico.',
            tags: JSON.stringify(['social-proof', 'pricing', 'copy']),
            isPinned: false,
            experimentId: 'exp-003',
        },
        {
            id: 'learn-004',
            title: 'Gamificação pode piorar experiência se for cosmética',
            summary: 'Adicionar badges sem valor real de recompensa aumenta complexidade percebida e reduz conversão.',
            category: 'ux',
            funnelStage: 'activation',
            impactLevel: 'medium',
            resultType: 'invalidated',
            evidence: 'Experimento de badges: -3.1% ativação. Feedback qualitativo: "parece um jogo infantil".',
            recommendation: 'Gamificação só funciona quando a recompensa tem valor real (desconto, feature premium, status).',
            tags: JSON.stringify(['gamification', 'ux', 'onboarding']),
            isPinned: false,
            experimentId: 'exp-004',
        },
        {
            id: 'learn-005',
            title: 'Desconto em exit intent desvaloriza o produto',
            summary: 'Pop-ups com desconto para quem vai sair treinam o usuário a aguardar o desconto e sinalizam baixa confiança no preço.',
            category: 'pricing',
            funnelStage: 'acquisition',
            impactLevel: 'high',
            resultType: 'invalidated',
            evidence: 'Taxa de bounce aumentou 4%. Net revenue por trial diminuiu 12% pois mais usuários aguardavam o pop-up.',
            recommendation: 'Não usar descontos emergenciais. Investir em proposta de valor ao invés de reduzir preço.',
            tags: JSON.stringify(['pricing', 'discount', 'exit-intent']),
            isPinned: false,
            experimentId: 'exp-005',
        },
        {
            id: 'learn-006',
            title: 'Email de retenção precisa chegar antes do churn acontecer',
            summary: 'Email educativo no D+7 chegou tarde para a maioria dos usuários que já haviam churnado no D+3-5.',
            category: 'retention',
            funnelStage: 'retention',
            impactLevel: 'medium',
            resultType: 'inconclusive',
            evidence: 'Análise de cohort: 65% do churn acontece no D+3. Email D+7 atinge apenas usuários já engajados.',
            recommendation: 'Testar touch points no D+1 (setup incompleto), D+3 (primeiro valor), D+5 (hábito).',
            tags: JSON.stringify(['email', 'retention', 'churn', 'timing']),
            isPinned: false,
            experimentId: 'exp-006',
        },
        {
            id: 'learn-007',
            title: 'Testes de cor de botão raramente valem o esforço',
            summary: 'Mudanças de cor de CTA geralmente não têm impacto estatisticamente significativo com volumes típicos.',
            category: 'ux',
            funnelStage: 'acquisition',
            impactLevel: 'low',
            resultType: 'inconclusive',
            evidence: 'Diferença de 1.1% não significativa com p=0.34. Precisaria de 10x mais tráfego para conclusão.',
            recommendation: 'Priorizar testes de copy, oferta e fluxo ao invés de elementos visuais isolados.',
            tags: JSON.stringify(['cro', 'ux', 'testing']),
            isPinned: false,
            experimentId: 'exp-007',
        },
        {
            id: 'learn-008',
            title: 'Live chat no trial tem alto ROI em escala, baixo ROI agora',
            summary: 'Suporte proativo via chat aumenta ativação mas o custo por usuário é alto para o volume atual.',
            category: 'activation',
            funnelStage: 'activation',
            impactLevel: 'medium',
            resultType: 'inconclusive',
            evidence: '+4.2% ativação mas custo de ~R$45/usuário ativado via chat vs R$12 média atual.',
            recommendation: 'Retestar com chatbot automatizado para reduzir custo operacional. Revisar quando MRR atingir 200k.',
            tags: JSON.stringify(['chat', 'support', 'activation', 'roi']),
            isPinned: false,
            experimentId: 'exp-008',
        },
    ];

    for (const learning of learningsData) {
        const { id, ...rest } = learning;
        await prisma.learning.upsert({
            where: { id },
            update: {},
            create: {
                id,
                ...rest,
                createdById: user.id,
                organizationId: org.id,
            },
        });
    }
    console.log(`✅ Created ${learningsData.length} learnings`);

    console.log('\n📝 Login credentials:');
    console.log('   Email: test@example.com');
    console.log('   Password: password123\n');
    console.log('🎉 Seed completed!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
