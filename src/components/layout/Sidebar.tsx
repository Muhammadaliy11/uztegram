'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  Home,
  Search,
  PlusSquare,
  Heart,
  User,
  LogOut,
  Compass,
  Moon,
  Sun,
  Globe,
  Settings,
  Send,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar-component'
import { CreatePost } from '@/components/post/CreatePost'
import { useState } from 'react'
import { useT } from '@/components/Providers'
import type { Locale } from '@/lib/i18n'

type SidebarUser = {
  id: string
  name?: string | null
  email?: string | null
  username?: string
  avatar?: string | null
}

const LOCALES: { code: Locale; label: string; flag: string }[] = [
  { code: 'uz', label: "O'zbek", flag: '🇺🇿' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
]

export function Sidebar({ user }: { user: SidebarUser }) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { t, locale, changeLocale } = useT()
  const [showCreate, setShowCreate] = useState(false)
  const [showLang, setShowLang] = useState(false)

  const navItems = [
    { href: '/', icon: Home, label: t.home },
    { href: '/explore', icon: Compass, label: t.explore },
    { icon: PlusSquare, label: t.newPost, onClick: () => setShowCreate(true) },
    { href: '/messages', icon: Send, label: 'Xabarlar' },
    { href: '/notifications', icon: Heart, label: t.notifications },
    { href: `/profile/${user.username}`, icon: User, label: t.profile },
  ]

  return (
    <>
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-64 xl:w-72 bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 px-3 py-6 z-30">
        {/* Logo */}
        <Link href="/" className="px-3 mb-8 block">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] bg-clip-text text-transparent">
            Uzstagram
          </h1>
        </Link>

        {/* Nav */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item, i) => {
            const isActive = item.href ? pathname === item.href : false
            const Icon = item.icon!
            const content = (
              <span
                className={cn(
                  'flex items-center gap-4 px-3 py-3 rounded-xl text-sm transition-all duration-200 cursor-pointer',
                  isActive
                    ? 'font-bold bg-gray-100 dark:bg-gray-900'
                    : 'font-normal hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-300'
                )}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span>{item.label}</span>
              </span>
            )
            return item.href ? (
              <Link key={i} href={item.href}>{content}</Link>
            ) : (
              <div key={i} onClick={item.onClick}>{content}</div>
            )
          })}
        </nav>

        {/* Bottom controls */}
        <div className="space-y-1">
          {/* Settings */}
          <Link
            href="/settings"
            className={cn(
              'flex items-center gap-4 px-3 py-3 rounded-xl text-sm transition-all cursor-pointer',
              pathname === '/settings'
                ? 'font-bold bg-gray-100 dark:bg-gray-900'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900'
            )}
          >
            <Settings size={24} strokeWidth={2} />
            <span>{t.settings}</span>
          </Link>

          {/* Dark mode */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-full flex items-center gap-4 px-3 py-3 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 transition-all"
          >
            {theme === 'dark' ? <Sun size={24} strokeWidth={2} /> : <Moon size={24} strokeWidth={2} />}
            <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
          </button>

          {/* Language */}
          <div className="relative">
            <button
              onClick={() => setShowLang(!showLang)}
              className="w-full flex items-center gap-4 px-3 py-3 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 transition-all"
            >
              <Globe size={24} strokeWidth={2} />
              <span>{LOCALES.find((l) => l.code === locale)?.flag} {LOCALES.find((l) => l.code === locale)?.label}</span>
            </button>
            {showLang && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowLang(false)} />
                <div className="absolute left-0 bottom-12 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-20 overflow-hidden min-w-44">
                  {LOCALES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => { changeLocale(l.code); setShowLang(false) }}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
                        locale === l.code && 'font-bold bg-gray-50 dark:bg-gray-800'
                      )}
                    >
                      <span>{l.flag}</span>
                      <span>{l.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* User */}
          <Link
            href={`/profile/${user.username}`}
            className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
          >
            <Avatar src={user.avatar} name={user.name || user.username || 'U'} size={32} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user.name || user.username}</p>
              <p className="text-xs text-gray-500 truncate">@{user.username}</p>
            </div>
          </Link>

          {/* Logout */}
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center gap-4 px-3 py-3 rounded-xl text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
          >
            <LogOut size={20} />
            <span>{t.logout}</span>
          </button>
        </div>
      </aside>

      {showCreate && <CreatePost onClose={() => setShowCreate(false)} />}
    </>
  )
}
