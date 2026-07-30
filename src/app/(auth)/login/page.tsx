import { LoginForm } from '@/components/auth/LoginForm'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function LoginPage() {
  const session = await auth()
  if (session) redirect('/')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black px-4">
      <div className="w-full max-w-xs">
        {/* Logo card */}
        <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-10 mb-3">
          {/* Instagram-style logo */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold" style={{
              fontFamily: 'Billabong, cursive, sans-serif',
              background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Uzstagram
            </h1>
          </div>
          <LoginForm />
        </div>

        {/* Register link */}
        <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-4 text-center text-sm">
          Hisobingiz yo&apos;qmi?{' '}
          <Link href="/register" className="font-semibold text-blue-500 hover:text-blue-600">
            Ro&apos;yxatdan o&apos;ting
          </Link>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          Uzstagram &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
