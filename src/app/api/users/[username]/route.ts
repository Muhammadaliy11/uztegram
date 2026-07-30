import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const session = await auth()

    const user = await db.user.findUnique({
      where: { username: params.username },
      select: {
        id: true,
        username: true,
        name: true,
        bio: true,
        avatar: true,
        website: true,
        email: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
          },
        },
        ...(session?.user?.id
          ? {
              followers: {
                where: { followerId: session.user.id },
                select: { id: true },
              },
            }
          : {}),
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 })
    }

    const isFollowing = session?.user?.id
      ? (user as any).followers?.length > 0
      : false

    return NextResponse.json({
      ...user,
      followers: undefined,
      isFollowing,
    })
  } catch (error) {
    console.error('[USER_GET]', error)
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
  }
}
