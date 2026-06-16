import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.organizationId) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { id } = await params

  const conversation = await prisma.conversation.findUnique({
    where: { id, organizationId: session.user.organizationId },
  })

  if (!conversation) {
    return new Response('Not found', { status: 404 })
  }

  const messages = await prisma.message.findMany({
    where: {
      conversationId: id,
      role: { in: ['user', 'assistant'] },
    },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      role: true,
      content: true,
      toolName: true,
      toolCallId: true,
      agentUsed: true,
      createdAt: true,
    },
  })

  return Response.json(messages)
}
