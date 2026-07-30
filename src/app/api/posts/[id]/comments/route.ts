import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const commentSchema = z.object({
  text: z.string().min(1).max(500),
})

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = commentSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const comment = await db.comment.create({
      data: {
        text: parsed.data.text,
        userId: session.user.id,
        postId: params.id,
      },
      include: {
        user: {
          select: { id: true, username: true, avatar: true },
        },
      },
    })

    // Notification
    const post = await db.post.findUnique({ where: { id: params.id } })
    if (post && post.userId !== session.user.id) {
      await db.notification.create({
        data: {
          type: 'comment',
          fromId: session.user.id,
          toId: post.userId,
          postId: params.id,
        },
      })
    }

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error('[COMMENT_POST]', error)
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const comments = await db.comment.findMany({
      where: { postId: params.id },
      include: {
        user: {
          select: { id: true, username: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error('[COMMENTS_GET]', error)
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
  }
}
