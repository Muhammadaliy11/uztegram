import { RegisterForm } from '@/components/auth/RegisterForm'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function RegisterPage() {
  const session = await auth()
  if (session) redirect('/')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black px-4 py-8">
      <div className="w-full max-w-xs">
        <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-10 mb-3">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold" style={{
              background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Uzstagram
            </h1>
            <p className="text-gray-500 text-sm mt-3 font-semibold">
              Do&apos;stlaringizning rasmlarini ko&apos;rish uchun ro&apos;yxatdan o&apos;ting
            </p>
          </div>
          <RegisterForm />
        </div>

        <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-4 text-center text-sm">
          Hisobingiz bormi?{' '}
          <Link href="/login" className="font-semibold text-blue-500 hover:text-blue-600">
            Kirish
          </Link>
        </div>
      </div>
    </div>
  )
}
