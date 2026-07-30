'use client'

import { useState, useEffect } from 'react'
import { Search, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useDebounce } from '@/hooks/useDebounce'
import { PostGrid } from '@/components/post/PostGrid'
import { Avatar } from '@/components/ui/avatar-component'
import type { PostWithDetails } from '@/types'

type SearchUser = {
  id: string
  username: string
  name: string | null
  avatar: string | null
  _count: { followers: number }
}

type ExploreData = {
  posts: PostWithDetails[]
  users?: SearchUser[]
}

export default function ExplorePage() {
  const [query, setQuery] = useState('')
  const [data, setData] = useState<ExploreData>({ posts: [] })
  const [loading, setLoading] = useState(true)
  const debouncedQuery = useDebounce(query, 400)

  useEffect(() => {
    setLoading(true)
    const url = debouncedQuery
      ? `/api/explore?q=${encodeURIComponent(debouncedQuery)}`
      : '/api/explore'

    fetch(url)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [debouncedQuery])

  return (
    <div>
      {/* Search bar */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Qidirish..."
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 border border-border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={28} className="animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* User results */}
          {data.users && data.users.length > 0 && (
            <div className="mb-6 bg-white dark:bg-gray-900 rounded-2xl border border-border overflow-hidden">
              <p className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b border-border">
                Foydalanuvchilar
              </p>
              <div className="divide-y divide-border">
                {data.users.map((user) => (
                  <Link
                    key={user.id}
                    href={`/profile/${user.username}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Avatar src={user.avatar} name={user.name || user.username} size={44} />
                    <div>
                      <p className="font-semibold text-sm">{user.username}</p>
                      {user.name && <p className="text-xs text-muted-foreground">{user.name}</p>}
                      <p className="text-xs text-muted-foreground">{user._count.followers} obunachi</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Post grid */}
          {data.posts.length > 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-border overflow-hidden">
              {query && (
                <p className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b border-border">
                  Postlar
                </p>
              )}
              <PostGrid posts={data.posts} />
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              {query ? (
                <>
                  <p className="text-lg mb-1">🔍</p>
                  <p>&quot;{query}&quot; bo&apos;yicha hech narsa topilmadi</p>
                </>
              ) : (
                <p>Hali post yo&apos;q</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
