import { useState, useEffect, useCallback } from 'react'
import type { PostWithDetails } from '@/types'

export function usePosts() {
  const [posts, setPosts] = useState<PostWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [cursor, setCursor] = useState<string | undefined>()

  const fetchPosts = useCallback(async (nextCursor?: string) => {
    try {
      const url = nextCursor ? `/api/posts?cursor=${nextCursor}` : '/api/posts'
      const res = await fetch(url)
      const data = await res.json()

      if (nextCursor) {
        setPosts((prev) => [...prev, ...data.posts])
      } else {
        setPosts(data.posts)
      }

      setHasMore(data.hasMore)
      setCursor(data.nextCursor)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const loadMore = () => {
    if (hasMore && cursor) fetchPosts(cursor)
  }

  const deletePost = (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id))
  }

  return { posts, loading, hasMore, loadMore, deletePost, refresh: () => fetchPosts() }
}
