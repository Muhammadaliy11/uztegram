'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  Trash2,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { cn, timeAgo, formatCount } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar-component'
import { CommentSection } from './CommentSection'
import type { PostWithDetails } from '@/types'
import { useToast } from '@/components/ui/toaster'
import { useT } from '@/components/Providers'

type PostCardProps = {
  post: PostWithDetails
  onDelete?: (id: string) => void
}

export function PostCard({ post, onDelete }: PostCardProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const { t } = useT()
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [liked, setLiked] = useState(
    post.likes.some((l) => l.userId === session?.user?.id)
  )
  const [likesCount, setLikesCount] = useState(post._count.likes)
  const [showComments, setShowComments] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [isLiking, setIsLiking] = useState(false)
  const [saved, setSaved] = useState(false)
  const [muted, setMuted] = useState(true)
  const [heartAnim, setHeartAnim] = useState(false)

  const isVideo = post.mediaType === 'video'
  const isOwner = session?.user?.id === post.user.id

  // Video autoplay on scroll (Intersection Observer)
  useEffect(() => {
    if (!isVideo || !videoRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoRef.current?.play().catch(() => {})
          } else {
            videoRef.current?.pause()
          }
        })
      },
      { threshold: 0.5 }
    )

    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [isVideo])

  const handleLike = async () => {
    if (isLiking) return
    setIsLiking(true)
    const newLiked = !liked
    setLiked(newLiked)
    setLikesCount((prev) => (liked ? prev - 1 : prev + 1))
    if (newLiked) {
      setHeartAnim(true)
      setTimeout(() => setHeartAnim(false), 300)
    }
    try {
      const res = await fetch(`/api/posts/${post.id}/like`, { method: 'POST' })
      if (!res.ok) {
        setLiked(liked)
        setLikesCount((prev) => (liked ? prev + 1 : prev - 1))
      }
    } catch {
      setLiked(liked)
      setLikesCount((prev) => (liked ? prev + 1 : prev - 1))
    } finally {
      setIsLiking(false)
    }
  }

  const handleDoubleClick = () => {
    if (!liked) handleLike()
    setHeartAnim(true)
    setTimeout(() => setHeartAnim(false), 600)
  }

  const handleDelete = async () => {
    if (!confirm('Postni o\'chirishni xohlaysizmi?')) return
    try {
      const res = await fetch(`/api/posts/${post.id}`, { method: 'DELETE' })
      if (res.ok) {
        onDelete?.(post.id)
        toast(t.deletePost + ' ✓', 'success')
      }
    } catch {
      toast(t.serverError, 'error')
    }
    setShowMenu(false)
  }

  return (
    <article className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden mb-4">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <Link href={`/profile/${post.user.username}`} className="flex items-center gap-3">
          {/* Story ring effect */}
          <div className="story-ring p-[2px] rounded-full">
            <div className="bg-white dark:bg-black rounded-full p-[2px]">
              <Avatar src={post.user.avatar} name={post.user.name || post.user.username} size={36} />
            </div>
          </div>
          <div>
            <p className="font-semibold text-sm leading-tight">{post.user.username}</p>
            <p className="text-xs text-gray-500">{timeAgo(post.createdAt)}</p>
          </div>
        </Link>

        {isOwner && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
            >
              <MoreHorizontal size={20} />
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-8 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-20 min-w-40 overflow-hidden">
                  <button
                    onClick={handleDelete}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors font-semibold"
                  >
                    <Trash2 size={16} />
                    {t.deletePost}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Media */}
      <div
        ref={containerRef}
        className="relative bg-black"
        style={{ aspectRatio: '1/1' }}
        onDoubleClick={handleDoubleClick}
      >
        {isVideo ? (
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              src={post.mediaUrl}
              className="feed-video"
              loop
              muted={muted}
              playsInline
              autoPlay
            />
            {/* Mute button */}
            <button
              onClick={() => setMuted(!muted)}
              className="absolute bottom-3 right-3 bg-black/60 text-white rounded-full p-1.5 hover:bg-black/80 transition-colors"
            >
              {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
          </div>
        ) : (
          <Image
            src={post.mediaUrl}
            alt={post.caption || 'Post'}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 600px"
          />
        )}

        {/* Double-tap heart animation */}
        {heartAnim && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Heart
              size={80}
              className="text-white fill-white drop-shadow-lg animate-heart-burst opacity-90"
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            {/* Like */}
            <button
              onClick={handleLike}
              className="transition-transform active:scale-90"
            >
              <Heart
                size={26}
                strokeWidth={2}
                className={cn(
                  'transition-all',
                  liked ? 'fill-red-500 text-red-500 scale-110' : 'text-black dark:text-white'
                )}
              />
            </button>
            {/* Comment */}
            <button
              onClick={() => setShowComments(!showComments)}
              className="transition-transform active:scale-90"
            >
              <MessageCircle size={26} strokeWidth={2} className="text-black dark:text-white" />
            </button>
            {/* Share */}
            <button className="transition-transform active:scale-90">
              <Send size={24} strokeWidth={2} className="text-black dark:text-white" />
            </button>
          </div>
          {/* Save */}
          <button
            onClick={() => setSaved(!saved)}
            className="transition-transform active:scale-90"
          >
            <Bookmark
              size={26}
              strokeWidth={2}
              className={cn(
                'transition-all',
                saved ? 'fill-black dark:fill-white text-black dark:text-white' : 'text-black dark:text-white'
              )}
            />
          </button>
        </div>

        {/* Likes count */}
        {likesCount > 0 && (
          <p className="text-sm font-semibold mb-1">
            {formatCount(likesCount)} {t.likes}
          </p>
        )}

        {/* Caption */}
        {post.caption && (
          <p className="text-sm leading-relaxed">
            <Link href={`/profile/${post.user.username}`} className="font-semibold mr-1 hover:underline">
              {post.user.username}
            </Link>
            {post.caption}
          </p>
        )}

        {/* View comments */}
        {post._count.comments > 0 && (
          <button
            onClick={() => setShowComments(!showComments)}
            className="text-sm text-gray-500 mt-1 hover:text-gray-700 dark:hover:text-gray-300 transition-colors block"
          >
            {showComments
              ? '▲ Yopish'
              : `${t.viewComments} (${post._count.comments})`}
          </button>
        )}
      </div>

      {/* Comments */}
      {showComments && (
        <div className="border-t border-gray-100 dark:border-gray-800">
          <CommentSection postId={post.id} />
        </div>
      )}
    </article>
  )
}
