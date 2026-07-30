'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Send, Loader2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { Avatar } from '@/components/ui/avatar-component'
import { timeAgo } from '@/lib/utils'
import type { CommentWithUser } from '@/types'

export function CommentSection({ postId }: { postId: string }) {
  const { data: session } = useSession()
  const [comments, setComments] = useState<CommentWithUser[]>([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch(`/api/posts/${postId}/comments`)
      .then((r) => r.json())
      .then(setComments)
      .finally(() => setLoading(false))
  }, [postId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || submitting) return

    setSubmitting(true)
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() }),
      })

      if (res.ok) {
        const comment = await res.json()
        setComments((prev) => [...prev, comment])
        setText('')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-4">
      {/* Comments list */}
      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 size={20} className="animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
          {comments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-2">
              Hali izoh yo&apos;q. Birinchi bo&apos;ling!
            </p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-2">
                <Link href={`/profile/${comment.user.username}`}>
                  <Avatar
                    src={comment.user.avatar}
                    name={comment.user.username}
                    size={28}
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <Link
                      href={`/profile/${comment.user.username}`}
                      className="font-semibold mr-1 hover:underline"
                    >
                      {comment.user.username}
                    </Link>
                    {comment.text}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {timeAgo(comment.createdAt)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add comment */}
      {session && (
        <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-border pt-3">
          <Avatar
            src={(session.user as any).avatar}
            name={session.user?.name || 'U'}
            size={28}
          />
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Izoh yozing..."
            className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!text.trim() || submitting}
            className="text-blue-500 hover:text-blue-600 disabled:opacity-40 transition-colors"
          >
            {submitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </form>
      )}
    </div>
  )
}
