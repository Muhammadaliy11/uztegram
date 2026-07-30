'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, MessageCircle, Video } from 'lucide-react'
import { formatCount } from '@/lib/utils'
import type { PostWithDetails } from '@/types'

type PostGridProps = {
  posts: PostWithDetails[]
}

export function PostGrid({ posts }: PostGridProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p>Hali post yo&apos;q</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-0.5">
      {posts.map((post) => (
        <Link key={post.id} href={`/post/${post.id}`} className="group relative aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden">
          {post.mediaType === 'video' ? (
            <>
              <video
                src={post.mediaUrl}
                className="w-full h-full object-cover"
                muted
                preload="metadata"
              />
              <div className="absolute top-2 right-2">
                <Video size={16} className="text-white drop-shadow" fill="white" />
              </div>
            </>
          ) : (
            <Image
              src={post.mediaUrl}
              alt={post.caption || 'Post'}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 33vw, 200px"
            />
          )}

          {/* Hover overlay */}
          <div className="post-overlay">
            <span className="flex items-center gap-1.5 text-white font-bold text-sm">
              <Heart size={20} fill="white" />
              {formatCount(post._count.likes)}
            </span>
            <span className="flex items-center gap-1.5 text-white font-bold text-sm">
              <MessageCircle size={20} fill="white" />
              {formatCount(post._count.comments)}
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}
