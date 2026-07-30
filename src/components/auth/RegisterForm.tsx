'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react'

const schema = z.object({
  email: z.string().email('Email noto\'g\'ri'),
  name: z.string().min(2, 'Ism kamida 2 ta belgi').max(50),
  username: z
    .string()
    .min(3, 'Username kamida 3 ta belgi')
    .max(30, 'Username 30 ta belgidan oshmasin')
    .regex(/^[a-z0-9_.]+$/, 'Faqat kichik harf, raqam, _ va . ishlatilsin'),
  password: z.string().min(6, 'Parol kamida 6 ta belgi'),
})

type FormData = z.infer<typeof schema>

export function RegisterForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const usernameValue = watch('username', '')

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const json = await res.json()

      if (!res.ok) {
        setError(json.error || 'Xatolik yuz berdi')
        return
      }

      setSuccess(true)

      // Avtomatik kirish
      await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      router.push('/')
      router.refresh()
    } catch {
      setError('Server bilan bog\'lanishda xatolik')
    }
  }

  if (success) {
    return (
      <div className="text-center py-4">
        <CheckCircle2 className="mx-auto text-green-500 mb-3" size={48} />
        <p className="text-green-600 font-semibold">Muvaffaqiyatli ro&apos;yxatdan o&apos;tdingiz!</p>
        <p className="text-muted-foreground text-sm mt-1">Yo&apos;naltirilmoqda...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      <div>
        <input
          {...register('email')}
          type="email"
          placeholder="Email"
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />
        {errors.email && (
          <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <input
          {...register('name')}
          type="text"
          placeholder="To'liq ism"
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />
        {errors.name && (
          <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
          <input
            {...register('username')}
            type="text"
            placeholder="username"
            className="w-full pl-8 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
        {errors.username ? (
          <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>
        ) : usernameValue.length >= 3 ? (
          <p className="text-green-500 text-xs mt-1">@{usernameValue} — mavjud</p>
        ) : null}
      </div>

      <div className="relative">
        <input
          {...register('password')}
          type={showPassword ? 'text' : 'password'}
          placeholder="Parol"
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition pr-12"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
        {errors.password && (
          <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Ro&apos;yxatdan o&apos;tish orqali siz bizning{' '}
        <span className="text-blue-500 cursor-pointer">Foydalanish shartlari</span>ga rozilik bildirasiz.
      </p>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold rounded-xl transition text-sm flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Ro&apos;yxatdan o&apos;tilmoqda...
          </>
        ) : (
          'Ro\'yxatdan o\'tish'
        )}
      </button>
    </form>
  )
}
