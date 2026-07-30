import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const post = await db.post.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: { id: true, username: true, name: true, avatar: true },
        },
        likes: { select: { userId: true } },
        comments: {
          include: {
            user: {
              select: { id: true, username: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        _count: { select: { likes: true, comments: true } },
      },
    })

    if (!post) {
      return NextResponse.json({ error: 'Post topilmadi' }, { status: 404 })
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('[POST_GET]', error)
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 401 })
    }

    const post = await db.post.findUnique({ where: { id: params.id } })

    if (!post) {
      return NextResponse.json({ error: 'Post topilmadi' }, { status: 404 })
    }

    if (post.userId !== session.user.id) {
      return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 403 })
    }

    await db.post.delete({ where: { id: params.id } })

    return NextResponse.json({ message: 'Post o\'chirildi' })
  } catch (error) {
    console.error('[POST_DELETE]', error)
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
  }
}
