import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

// GET - suhbat xabarlarini olish
export async function GET(
  req: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 401 })
    }

    // Foydalanuvchi shu suhbatda borligini tekshirish
    const participant = await db.conversationParticipant.findFirst({
      where: {
        conversationId: params.conversationId,
        userId: session.user.id,
      },
    })

    if (!participant) {
      return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 403 })
    }

    const messages = await db.message.findMany({
      where: { conversationId: params.conversationId },
      include: {
        sender: {
          select: { id: true, username: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    // Xabarlarni o'qilgan deb belgilash
    await db.message.updateMany({
      where: {
        conversationId: params.conversationId,
        senderId: { not: session.user.id },
        read: false,
      },
      data: { read: true },
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('[MESSAGES_CONV_GET]', error)
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
  }
}

// POST - xabar yuborish
export async function POST(
  req: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 401 })
    }

    const { text } = await req.json()
    if (!text?.trim()) {
      return NextResponse.json({ error: 'Xabar bo\'sh bo\'lmasligi kerak' }, { status: 400 })
    }

    // Suhbatda borligini tekshirish
    const participant = await db.conversationParticipant.findFirst({
      where: {
        conversationId: params.conversationId,
        userId: session.user.id,
      },
    })

    if (!participant) {
      return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 403 })
    }

    const message = await db.message.create({
      data: {
        text: text.trim(),
        conversationId: params.conversationId,
        senderId: session.user.id,
      },
      include: {
        sender: {
          select: { id: true, username: true, avatar: true },
        },
      },
    })

    // Suhbat updatedAt ni yangilash
    await db.conversation.update({
      where: { id: params.conversationId },
      data: { updatedAt: new Date() },
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('[MESSAGE_POST]', error)
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
  }
}
