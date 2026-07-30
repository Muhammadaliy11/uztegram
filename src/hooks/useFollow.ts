import { useState } from 'react'

export function useFollow(
  initialFollowing: boolean,
  initialCount: number,
  targetUserId: string
) {
  const [following, setFollowing] = useState(initialFollowing)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)

  const toggle = async () => {
    if (loading) return
    setLoading(true)

    setFollowing(!following)
    setCount((prev) => (following ? prev - 1 : prev + 1))

    try {
      const res = await fetch('/api/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId }),
      })

      if (!res.ok) {
        // Revert on error
        setFollowing(following)
        setCount((prev) => (following ? prev + 1 : prev - 1))
      }
    } catch {
      setFollowing(following)
      setCount((prev) => (following ? prev + 1 : prev - 1))
    } finally {
      setLoading(false)
    }
  }

  return { following, count, loading, toggle }
}
