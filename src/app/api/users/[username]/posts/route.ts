import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const user = await db.user.findUnique({
      where: { username: params.username },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 })
    }

    const posts = await db.post.findMany({
      where: { userId: user.id },
      include: {
        user: {
          select: { id: true, username: true, name: true, avatar: true },
        },
        likes: { select: { userId: true } },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(posts)
  } catch (error) {
    console.error('[USER_POSTS_GET]', error)
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
  }
}
