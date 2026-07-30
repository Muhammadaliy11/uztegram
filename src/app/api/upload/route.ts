import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { UTApi } from 'uploadthing/server'

const utapi = new UTApi()

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'Fayl topilmadi' }, { status: 400 })
    }

    // File hajmini tekshirish
    const maxSize = file.type.startsWith('video/') ? 256 * 1024 * 1024 : 16 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `Fayl hajmi ${file.type.startsWith('video/') ? '256MB' : '16MB'} dan katta bo'lmasligi kerak` },
        { status: 400 }
      )
    }

    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/quicktime', 'video/webm',
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Qo\'llab-quvvatlanmaydigan fayl turi' },
        { status: 400 }
      )
    }

    // UploadThing ga yuklash
    const response = await utapi.uploadFiles(file)

    if (response.error) {
      console.error('[UPLOAD_ERROR]', response.error)
      return NextResponse.json({ error: 'Upload muvaffaqiyatsiz' }, { status: 500 })
    }

    return NextResponse.json({
      url: response.data.url,
      key: response.data.key,
      resourceType: file.type.startsWith('video/') ? 'video' : 'image',
    })
  } catch (error) {
    console.error('[UPLOAD_ERROR]', error)
    return NextResponse.json({ error: 'Upload muvaffaqiyatsiz' }, { status: 500 })
  }
}
