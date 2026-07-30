import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const updateProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9_.]+$/)
    .optional(),
  bio: z.string().max(150).optional(),
  website: z.string().url().optional().or(z.literal('')),
  avatar: z.string().url().optional(),
})

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = updateProfileSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    // Username band emasligini tekshirish
    if (parsed.data.username) {
      const existing = await db.user.findFirst({
        where: {
          username: parsed.data.username,
          NOT: { id: session.user.id },
        },
      })
      if (existing) {
        return NextResponse.json({ error: 'Bu username band' }, { status: 400 })
      }
    }

    const updated = await db.user.update({
      where: { id: session.user.id },
      data: parsed.data,
      select: {
        id: true,
        username: true,
        name: true,
        bio: true,
        avatar: true,
        website: true,
        email: true,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('[PROFILE_PATCH]', error)
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
  }
}
