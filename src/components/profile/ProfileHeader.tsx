'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Settings, UserPlus, UserMinus, Loader2, MessageCircle } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar-component'
import { formatCount } from '@/lib/utils'
import type { UserProfile } from '@/types'
import { useToast } from '@/components/ui/toaster'

type ProfileHeaderProps = {
  user: UserProfile
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const router = useRouter()
  const [following, setFollowing] = useState(user.isFollowing || false)
  const [followersCount, setFollowersCount] = useState(user._count.followers)
  const [isLoading, setIsLoading] = useState(false)
  const [msgLoading, setMsgLoading] = useState(false)

  const isOwn = session?.user?.id === user.id

  const handleMessage = async () => {
    if (msgLoading) return
    setMsgLoading(true)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: user.id }),
      })
      if (res.ok) {
        const conv = await res.json()
        router.push(`/messages?conv=${conv.id}`)
      }
    } catch {
      toast('Xatolik yuz berdi', 'error')
    } finally {
      setMsgLoading(false)
    }
  }

  const handleFollow = async () => {    if (isLoading) return
    setIsLoading(true)

    // Optimistic
    setFollowing(!following)
    setFollowersCount((prev) => (following ? prev - 1 : prev + 1))

    try {
      const res = await fetch('/api/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: user.id }),
      })

      if (!res.ok) {
        setFollowing(following)
        setFollowersCount((prev) => (following ? prev + 1 : prev - 1))
        toast('Xatolik yuz berdi', 'error')
      } else {
        toast(following ? 'Bekor qilindi' : `@${user.username} ga obuna bo'ldingiz`, 'success')
      }
    } catch {
      setFollowing(following)
      setFollowersCount((prev) => (following ? prev + 1 : prev - 1))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-border p-6 mb-4">
      <div className="flex items-start gap-6">
        {/* Avatar */}
        <Avatar
          src={user.avatar}
          name={user.name || user.username}
          size={80}
          className="flex-shrink-0"
        />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold">{user.username}</h1>

            {isOwn ? (
              <Link
                href="/settings"
                className="flex items-center gap-1.5 px-4 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <Settings size={14} />
                Tahrirlash
              </Link>
            ) : session ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleFollow}
                  disabled={isLoading}
                  className={`flex items-center gap-1.5 px-5 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                    following
                      ? 'bg-gray-100 dark:bg-gray-800 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/20'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {isLoading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : following ? (
                    <><UserMinus size={14} /> Bekor qilish</>
                  ) : (
                    <><UserPlus size={14} /> Obuna bo&apos;lish</>
                  )}
                </button>
                <button
                  onClick={handleMessage}
                  disabled={msgLoading}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  {msgLoading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <><MessageCircle size={14} /> Xabar</>
                  )}
                </button>
              </div>
            ) : null}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mt-3">
            <div className="text-center">
              <p className="font-bold">{formatCount(user._count.posts)}</p>
              <p className="text-xs text-muted-foreground">post</p>
            </div>
            <div className="text-center">
              <p className="font-bold">{formatCount(followersCount)}</p>
              <p className="text-xs text-muted-foreground">obunachilar</p>
            </div>
            <div className="text-center">
              <p className="font-bold">{formatCount(user._count.following)}</p>
              <p className="text-xs text-muted-foreground">obunalar</p>
            </div>
          </div>

          {/* Bio */}
          {(user.name || user.bio || user.website) && (
            <div className="mt-3">
              {user.name && <p className="font-semibold text-sm">{user.name}</p>}
              {user.bio && <p className="text-sm mt-0.5 whitespace-pre-line">{user.bio}</p>}
              {user.website && (
                <a
                  href={user.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-500 hover:underline mt-0.5 block"
                >
                  {user.website.replace(/^https?:\/\//, '')}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
