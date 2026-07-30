import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const createPostSchema = z.object({
  caption: z.string().max(2200).optional(),
  mediaUrl: z.string().url(),
  mediaType: z.enum(['image', 'video']).default('image'),
})

// GET - Feed postlarini olish
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const cursor = searchParams.get('cursor')
    const limit = 10

    // Foydalanuvchi follow qilganlarning postlari + o'zining postlari
    const followingIds = await db.follow.findMany({
      where: { followerId: session.user.id },
      select: { followingId: true },
    })

    const userIds = [session.user.id, ...followingIds.map((f) => f.followingId)]

    const posts = await db.post.findMany({
      where: { userId: { in: userIds } },
      include: {
        user: {
          select: { id: true, username: true, name: true, avatar: true },
        },
        likes: { select: { userId: true } },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    })

    const hasMore = posts.length > limit
    const data = hasMore ? posts.slice(0, -1) : posts

    return NextResponse.json({
      posts: data,
      nextCursor: hasMore ? data[data.length - 1].id : undefined,
      hasMore,
    })
  } catch (error) {
    console.error('[POSTS_GET]', error)
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
  }
}

// POST - Yangi post yaratish
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = createPostSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const post = await db.post.create({
      data: {
        ...parsed.data,
        userId: session.user.id,
      },
      include: {
        user: {
          select: { id: true, username: true, name: true, avatar: true },
        },
        likes: { select: { userId: true } },
        _count: { select: { likes: true, comments: true } },
      },
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error('[POSTS_POST]', error)
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
  }
}
