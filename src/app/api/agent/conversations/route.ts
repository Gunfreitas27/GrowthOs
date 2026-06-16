import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.organizationId) {
    return new Response('Unauthorized', { status: 401 })
  }

  const conversations = await prisma.conversation.findMany({
    where: {
      organizationId: session.user.organizationId,
      userId: session.user.id,
      status: 'ACTIVE',
    },
    orderBy: { updatedAt: 'desc' },
    take: 30,
    select: {
      id: true,
      title: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { messages: true } },
    },
  })

  return Response.json(conversations)
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user?.organizationId) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { id } = await req.json()
  if (!id) return new Response('ID required', { status: 400 })

  await prisma.conversation.update({
    where: { id, organizationId: session.user.organizationId },
    data: { status: 'ARCHIVED' },
  })

  return Response.json({ success: true })
}
