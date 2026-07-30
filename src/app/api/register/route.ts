import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { generateUsername } from '@/lib/utils'

const registerSchema = z.object({
  email: z.string().email('Email noto\'g\'ri'),
  password: z.string().min(6, 'Parol kamida 6 ta belgi'),
  name: z.string().min(2, 'Ism kamida 2 ta belgi'),
  username: z
    .string()
    .min(3, 'Username kamida 3 ta belgi')
    .max(30, 'Username 30 ta belgidan ko\'p bo\'lmasligi kerak')
    .regex(/^[a-z0-9_.]+$/, 'Username faqat harf, raqam, _ va . dan iborat bo\'lishi kerak'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const { email, password, name, username } = parsed.data

    // Email mavjudligini tekshirish
    const existingEmail = await db.user.findUnique({ where: { email } })
    if (existingEmail) {
      return NextResponse.json(
        { error: 'Bu email allaqachon ro\'yxatdan o\'tgan' },
        { status: 400 }
      )
    }

    // Username mavjudligini tekshirish
    const existingUsername = await db.user.findUnique({ where: { username } })
    if (existingUsername) {
      return NextResponse.json(
        { error: 'Bu username band' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        username,
      },
    })

    return NextResponse.json(
      {
        message: 'Ro\'yxatdan o\'tish muvaffaqiyatli',
        user: { id: user.id, email: user.email, username: user.username },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[REGISTER_ERROR]', error)
    return NextResponse.json(
      { error: 'Server xatosi' },
      { status: 500 }
    )
  }
}
