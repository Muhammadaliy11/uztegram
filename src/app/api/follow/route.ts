import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const followSchema = z.object({
  targetUserId: z.string(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = followSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Noto\'g\'ri ma\'lumot' }, { status: 400 })
    }

    const { targetUserId } = parsed.data

    if (targetUserId === session.user.id) {
      return NextResponse.json(
        { error: 'O\'zingizga follow qilolmaysiz' },
        { status: 400 }
      )
    }

    const existingFollow = await db.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: targetUserId,
        },
      },
    })

    if (existingFollow) {
      // Unfollow
      await db.follow.delete({ where: { id: existingFollow.id } })
      return NextResponse.json({ following: false })
    } else {
      // Follow
      await db.follow.create({
        data: {
          followerId: session.user.id,
          followingId: targetUserId,
        },
      })

      // Notification
      await db.notification.create({
        data: {
          type: 'follow',
          fromId: session.user.id,
          toId: targetUserId,
        },
      })

      return NextResponse.json({ following: true })
    }
  } catch (error) {
    console.error('[FOLLOW_POST]', error)
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
  }
}
