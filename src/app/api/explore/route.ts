import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q') || ''

    if (query) {
      // Qidiruv
      const [users, posts] = await Promise.all([
        db.user.findMany({
          where: {
            OR: [
              { username: { contains: query, mode: 'insensitive' } },
              { name: { contains: query, mode: 'insensitive' } },
            ],
          },
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
            _count: { select: { followers: true } },
          },
          take: 10,
        }),
        db.post.findMany({
          where: {
            caption: { contains: query, mode: 'insensitive' },
          },
          include: {
            user: {
              select: { id: true, username: true, name: true, avatar: true },
            },
            _count: { select: { likes: true, comments: true } },
            likes: { select: { userId: true } },
          },
          take: 20,
        }),
      ])

      return NextResponse.json({ users, posts })
    }

    // Explore - mashhur postlar
    const posts = await db.post.findMany({
      include: {
        user: {
          select: { id: true, username: true, name: true, avatar: true },
        },
        _count: { select: { likes: true, comments: true } },
        likes: { select: { userId: true } },
      },
      orderBy: [{ likes: { _count: 'desc' } }, { createdAt: 'desc' }],
      take: 30,
    })

    return NextResponse.json({ posts })
  } catch (error) {
    console.error('[EXPLORE_GET]', error)
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
  }
}
