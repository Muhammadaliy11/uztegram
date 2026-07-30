import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, MessageCircle } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar-component'
import { CommentSection } from '@/components/post/CommentSection'
import { timeAgo, formatCount } from '@/lib/utils'

type PageProps = {
  params: { id: string }
}

export default async function PostPage({ params }: PageProps) {
  const session = await auth()

  const post = await db.post.findUnique({
    where: { id: params.id },
    include: {
      user: {
        select: { id: true, username: true, name: true, avatar: true },
      },
      likes: { select: { userId: true } },
      _count: { select: { likes: true, comments: true } },
    },
  })

  if (!post) notFound()

  const isLiked = session?.user?.id
    ? post.likes.some((l) => l.userId === session.user!.id)
    : false

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-border overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Media */}
        <div className="relative aspect-square md:w-96 flex-shrink-0 bg-black">
          {post.mediaType === 'video' ? (
            <video
              src={post.mediaUrl}
              controls
              className="w-full h-full object-contain"
              playsInline
            />
          ) : (
            <Image
              src={post.mediaUrl}
              alt={post.caption || 'Post'}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 384px"
            />
          )}
        </div>

        {/* Right side */}
        <div className="flex flex-col flex-1 min-h-96">
          {/* User */}
          <div className="flex items-center gap-3 p-4 border-b border-border">
            <Link href={`/profile/${post.user.username}`}>
              <Avatar src={post.user.avatar} name={post.user.name || post.user.username} size={36} />
            </Link>
            <div>
              <Link href={`/profile/${post.user.username}`} className="font-semibold text-sm hover:underline">
                {post.user.username}
              </Link>
              {post.user.name && (
                <p className="text-xs text-muted-foreground">{post.user.name}</p>
              )}
            </div>
          </div>

          {/* Caption */}
          {post.caption && (
            <div className="p-4 border-b border-border">
              <p className="text-sm">
                <span className="font-semibold mr-2">{post.user.username}</span>
                {post.caption}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{timeAgo(post.createdAt)}</p>
            </div>
          )}

          {/* Comments */}
          <div className="flex-1 overflow-y-auto">
            <CommentSection postId={post.id} />
          </div>

          {/* Stats */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1.5">
                <Heart size={18} className={isLiked ? 'fill-red-500 text-red-500' : ''} />
                <span className="font-semibold">{formatCount(post._count.likes)}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <MessageCircle size={18} />
                <span className="font-semibold">{formatCount(post._count.comments)}</span>
              </span>
              <span className="text-muted-foreground text-xs ml-auto">{timeAgo(post.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
