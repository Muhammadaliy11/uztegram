import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

// GET - barcha suhbatlarni olish
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 401 })
    }

    const conversations = await db.conversation.findMany({
      where: {
        participants: {
          some: { userId: session.user.id },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, username: true, name: true, avatar: true },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json(conversations)
  } catch (error) {
    console.error('[MESSAGES_GET]', error)
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
  }
}

// POST - yangi suhbat boshlash yoki mavjudini topish
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 401 })
    }

    const { targetUserId } = await req.json()

    if (targetUserId === session.user.id) {
      return NextResponse.json({ error: 'O\'zingizga xabar yubora olmaysiz' }, { status: 400 })
    }

    // Mavjud suhbatni topish
    const existing = await db.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: session.user.id } } },
          { participants: { some: { userId: targetUserId } } },
        ],
      },
      include: {
        participants: {
          include: {
            user: { select: { id: true, username: true, name: true, avatar: true } },
          },
        },
      },
    })

    if (existing) {
      return NextResponse.json(existing)
    }

    // Yangi suhbat yaratish
    const conversation = await db.conversation.create({
      data: {
        participants: {
          create: [
            { userId: session.user.id },
            { userId: targetUserId },
          ],
        },
      },
      include: {
        participants: {
          include: {
            user: { select: { id: true, username: true, name: true, avatar: true } },
          },
        },
      },
    })

    return NextResponse.json(conversation, { status: 201 })
  } catch (error) {
    console.error('[CONVERSATION_POST]', error)
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
  }
}
