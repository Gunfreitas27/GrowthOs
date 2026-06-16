import { prisma } from '@/lib/prisma'
import type { OrgContext } from './types'
import type { Funnel, FunnelSnapshot, Experiment, Learning, Channel, ChannelMetrics } from '@prisma/client'

type FunnelWithSnapshots = Funnel & { snapshots: FunnelSnapshot[] }
type ChannelWithMetrics = Channel & { metrics: ChannelMetrics[] }

interface StageData {
  stageName: string
  value: number | string
}

export async function buildOrgContext(
  organizationId: string
): Promise<OrgContext> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const [org, funnels, experiments, learnings, channels] =
    await Promise.all([
      prisma.organization.findUnique({ where: { id: organizationId } }),
      prisma.funnel.findMany({
        where: { organizationId },
        include: {
          snapshots: { take: 2, orderBy: { snapshotDate: 'desc' } },
        },
        take: 5,
      }),
      prisma.experiment.findMany({
        where: {
          organizationId,
          status: { in: ['in_progress', 'backlog', 'idea'] },
        },
        orderBy: { priorityScore: 'desc' },
        take: 10,
      }),
      prisma.learning.findMany({
        where: { organizationId },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
      prisma.channel.findMany({
        where: { organizationId },
        include: {
          metrics: {
            where: { date: { gte: thirtyDaysAgo } },
            take: 30,
            orderBy: { date: 'desc' },
          },
        },
      }),
    ])

  return {
    orgName: org?.name ?? 'sua empresa',
    funnelSummary: formatFunnelSummary(funnels),
    experimentSummary: formatExperimentSummary(experiments),
    learningSummary: formatLearningSummary(learnings),
    channelSummary: formatChannelSummary(channels),
    velocitySummary: formatVelocitySummary(experiments),
  }
}

function formatFunnelSummary(funnels: FunnelWithSnapshots[]): string {
  if (!funnels.length) return 'Nenhum funil cadastrado ainda.'

  return funnels
    .map((f) => {
      const latest = f.snapshots?.[0]
      let stageInfo = ''
      if (latest?.stageData) {
        try {
          const stages = JSON.parse(latest.stageData) as StageData[]
          stageInfo = stages
            .map((s) => `${s.stageName}: ${s.value}`)
            .join(' → ')
        } catch {
          stageInfo = 'dados não disponíveis'
        }
      }
      return `Funil "${f.name}": ${stageInfo || 'sem snapshots'}`
    })
    .join('\n')
}

function formatExperimentSummary(experiments: Experiment[]): string {
  if (!experiments.length) return 'Nenhum experimento ativo.'

  const top = experiments.slice(0, 5).map((e) => {
    const score = e.priorityScore ? `(score: ${e.priorityScore.toFixed(1)})` : ''
    return `- "${e.title}" [${e.status}] [${e.funnelStage}] ${score}`
  })

  return `${experiments.length} experimentos ativos.\n${top.join('\n')}`
}

function formatLearningSummary(learnings: Learning[]): string {
  if (!learnings.length) return 'Nenhum aprendizado registrado ainda.'

  return learnings
    .slice(0, 5)
    .map((l) => `- [${l.impactLevel.toUpperCase()}] ${l.title}: ${l.summary}`)
    .join('\n')
}

function formatChannelSummary(channels: ChannelWithMetrics[]): string {
  if (!channels.length) return 'Nenhum canal conectado.'

  return channels
    .map((c) => {
      const recentMetrics = c.metrics?.slice(0, 7) ?? []
      const totalSpend = recentMetrics.reduce(
        (acc, m) => acc + parseFloat(m.spend?.toString() ?? '0'),
        0
      )
      const totalRevenue = recentMetrics.reduce(
        (acc, m) => acc + parseFloat(m.revenue?.toString() ?? '0'),
        0
      )
      const roas = totalSpend > 0 ? (totalRevenue / totalSpend).toFixed(2) : 'N/A'
      return `${c.displayName} [${c.status}]: spend R$${totalSpend.toFixed(0)} | ROAS ${roas}x`
    })
    .join('\n')
}

function formatVelocitySummary(experiments: Experiment[]): string {
  const inProgress = experiments.filter((e) => e.status === 'in_progress').length
  const completed = experiments.filter((e) => e.status === 'completed')
  const wins = completed.filter((e) => e.result === 'win').length
  const winRate =
    completed.length > 0
      ? Math.round((wins / completed.length) * 100)
      : 0

  return `${inProgress} rodando agora | ${completed.length} concluídos | ${winRate}% win rate`
}
