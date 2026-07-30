import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { PostCard } from '@/components/post/PostCard'
import { SuggestedUsers } from '@/components/SuggestedUsers'
import { Avatar } from '@/components/ui/avatar-component'
import Link from 'next/link'
import type { PostWithDetails } from '@/types'

async function getFeedPosts(userId: string): Promise<PostWithDetails[]> {
  const followingIds = await db.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  })
  const userIds = [userId, ...followingIds.map((f) => f.followingId)]
  const posts = await db.post.findMany({
    where: { userId: { in: userIds } },
    include: {
      user: { select: { id: true, username: true, name: true, avatar: true } },
      likes: { select: { userId: true } },
      _count: { select: { likes: true, comments: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })
  return posts as PostWithDetails[]
}

export default async function FeedPage() {
  const session = await auth()
  const posts = await getFeedPosts(session!.user!.id as string)

  return (
    <div className="flex gap-8 justify-center">
      {/* Feed */}
      <div className="w-full max-w-[470px]">
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 border-2 border-gray-300 dark:border-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📸</span>
            </div>
            <h2 className="font-bold text-xl mb-2">Xush kelibsiz!</h2>
            <p className="text-gray-500 text-sm mb-4">
              Odamlarni kuzating va ularning postlarini shu yerda ko&apos;ring
            </p>
            <Link
              href="/explore"
              className="inline-block px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold text-sm hover:bg-blue-600 transition-colors"
            >
              Odamlarni topish
            </Link>
          </div>
        ) : (
          <div>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>

      {/* Right sidebar */}
      <div className="hidden xl:block w-80 flex-shrink-0 pt-2">
        <div className="sticky top-6">
          <div className="flex items-center gap-3 mb-6">
            <Link href={`/profile/${(session?.user as any)?.username}`}>
              <div className="story-ring p-[2px] rounded-full">
                <div className="bg-white dark:bg-black rounded-full p-[2px]">
                  <Avatar
                    src={(session?.user as any)?.avatar}
                    name={session?.user?.name || 'U'}
                    size={44}
                  />
                </div>
              </div>
            </Link>
            <div className="flex-1 min-w-0">
              <Link
                href={`/profile/${(session?.user as any)?.username}`}
                className="font-semibold text-sm hover:underline block truncate"
              >
                {(session?.user as any)?.username}
              </Link>
              <p className="text-sm text-gray-500 truncate">{session?.user?.name}</p>
            </div>
            <Link href="/login" className="text-xs font-semibold text-blue-500 hover:text-blue-700">
              Switch
            </Link>
          </div>

          <SuggestedUsers currentUserId={session!.user!.id as string} />

          <p className="text-xs text-gray-400 mt-8 leading-relaxed">
            About · Help · Press · API · Jobs · Privacy · Terms · Locations · Language<br /><br />
            © {new Date().getFullYear()} Uzstagram
          </p>
        </div>
      </div>
    </div>
  )
}
