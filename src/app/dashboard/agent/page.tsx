import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { ChatInterface } from '@/components/agent/chat-interface'

export default async function AgentPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  if (!session.user.organizationId) {
    redirect('/onboarding')
  }

  const userName = session.user.name ?? session.user.email ?? 'usuário'
  const orgId = session.user.organizationId

  // Get org name
  let orgName = 'sua empresa'
  try {
    const { prisma } = await import('@/lib/prisma')
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { name: true },
    })
    orgName = org?.name ?? orgName
  } catch {
    // ignore
  }

  return (
    <ChatInterface
      userName={userName}
      orgName={orgName}
    />
  )
}
