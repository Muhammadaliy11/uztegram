'use client'

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useSession } from 'next-auth/react'
import { Camera, Loader2, CheckCircle2 } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar-component'
import { useToast } from '@/components/ui/toaster'
import { useRouter } from 'next/navigation'

const schema = z.object({
  name: z.string().min(2, 'Ism kamida 2 ta belgi').max(50),
  username: z
    .string()
    .min(3, 'Username kamida 3 ta belgi')
    .max(30)
    .regex(/^[a-z0-9_.]+$/, 'Faqat kichik harf, raqam, _ va .'),
  bio: z.string().max(150, 'Bio 150 ta belgidan oshmasin').optional(),
  website: z.string().url('To\'g\'ri URL kiriting').optional().or(z.literal('')),
})

type FormData = z.infer<typeof schema>

type ProfileSettingsProps = {
  user: {
    id: string
    name: string | null
    username: string
    bio: string | null
    website: string | null
    avatar: string | null
    email: string
  }
}

export function ProfileSettings({ user }: ProfileSettingsProps) {
  const { update } = useSession()
  const { toast } = useToast()
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [avatarUrl, setAvatarUrl] = useState(user.avatar)
  const [avatarUploading, setAvatarUploading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user.name || '',
      username: user.username,
      bio: user.bio || '',
      website: user.website || '',
    },
  })

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setAvatarUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!res.ok) {
        toast('Rasm yuklanmadi', 'error')
        return
      }

      const { url } = await res.json()

      // Update profile with new avatar
      await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: url }),
      })

      setAvatarUrl(url)
      await update()
      toast('Profil rasmi yangilandi', 'success')
    } catch {
      toast('Xatolik yuz berdi', 'error')
    } finally {
      setAvatarUploading(false)
    }
  }

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const json = await res.json()

      if (!res.ok) {
        toast(json.error || 'Xatolik yuz berdi', 'error')
        return
      }

      await update()
      toast('Profil yangilandi!', 'success')
      router.refresh()
    } catch {
      toast('Server bilan bog\'lanishda xatolik', 'error')
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-border p-6">
      <h2 className="text-lg font-bold mb-6">Profil sozlamalari</h2>

      {/* Avatar */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <Avatar
            src={avatarUrl}
            name={user.name || user.username}
            size={72}
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={avatarUploading}
            className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors"
          >
            {avatarUploading ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Camera size={12} />
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
        <div>
          <p className="font-semibold">{user.username}</p>
          <button
            onClick={() => fileRef.current?.click()}
            className="text-blue-500 text-sm hover:text-blue-600"
          >
            Profil rasmini o&apos;zgartirish
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">To&apos;liq ism</label>
          <input
            {...register('name')}
            type="text"
            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Username</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
            <input
              {...register('username')}
              type="text"
              className="w-full pl-8 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
          {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Bio</label>
          <textarea
            {...register('bio')}
            rows={3}
            placeholder="O'zingiz haqida..."
            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
          />
          {errors.bio && <p className="text-red-500 text-xs mt-1">{errors.bio.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Veb-sayt</label>
          <input
            {...register('website')}
            type="url"
            placeholder="https://example.com"
            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
          {errors.website && <p className="text-red-500 text-xs mt-1">{errors.website.message}</p>}
        </div>

        <div className="pt-2">
          <p className="text-sm text-muted-foreground mb-4">
            Email: <span className="font-medium text-foreground">{user.email}</span>
          </p>

          <button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold rounded-xl transition text-sm flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saqlanmoqda...
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                Saqlash
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
