'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, PlusSquare, Heart, User, Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CreatePost } from '@/components/post/CreatePost'
import { useState } from 'react'
import { Avatar } from '@/components/ui/avatar-component'

type NavUser = {
  id: string
  username?: string
  avatar?: string | null
  name?: string | null
}

export function MobileNav({ user }: { user: NavUser }) {
  const pathname = usePathname()
  const [showCreate, setShowCreate] = useState(false)

  const navItems = [
    { href: '/', icon: Home },
    { href: '/explore', icon: Search },
    { icon: PlusSquare, onClick: () => setShowCreate(true) },
    { href: '/messages', icon: Send },
    { href: '/notifications', icon: Heart },
    { href: `/profile/${user.username}`, isAvatar: true },
  ]

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 z-30 px-2 py-2">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {navItems.map((item, i) => {
            const isActive = item.href ? pathname === item.href : false

            if (item.isAvatar) {
              return (
                <Link key={i} href={item.href!} className="p-2">
                  <Avatar
                    src={user.avatar}
                    name={user.name || user.username || 'U'}
                    size={26}
                    className={cn(
                      'ring-2 ring-offset-1',
                      isActive
                        ? 'ring-black dark:ring-white ring-offset-white dark:ring-offset-black'
                        : 'ring-transparent'
                    )}
                  />
                </Link>
              )
            }

            const Icon = item.icon!
            const content = (
              <span className="p-2 flex items-center justify-center">
                <Icon
                  size={26}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={isActive ? 'text-black dark:text-white' : 'text-gray-500 dark:text-gray-400'}
                />
              </span>
            )

            return item.href ? (
              <Link key={i} href={item.href}>{content}</Link>
            ) : (
              <div key={i} onClick={item.onClick} className="cursor-pointer">{content}</div>
            )
          })}
        </div>
      </nav>

      {showCreate && <CreatePost onClose={() => setShowCreate(false)} />}
    </>
  )
}
