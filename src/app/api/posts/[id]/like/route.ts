import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 401 })
    }

    const existingLike = await db.like.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId: params.id,
        },
      },
    })

    if (existingLike) {
      // Unlike
      await db.like.delete({
        where: { id: existingLike.id },
      })
      return NextResponse.json({ liked: false })
    } else {
      // Like
      await db.like.create({
        data: {
          userId: session.user.id,
          postId: params.id,
        },
      })

      // Notification yaratish (o'z postiga like bosmasin)
      const post = await db.post.findUnique({ where: { id: params.id } })
      if (post && post.userId !== session.user.id) {
        await db.notification.create({
          data: {
            type: 'like',
            fromId: session.user.id,
            toId: post.userId,
            postId: params.id,
          },
        })
      }

      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    console.error('[LIKE_POST]', error)
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
  }
}
