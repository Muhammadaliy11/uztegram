import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { PostGrid } from '@/components/post/PostGrid'
import type { UserProfile, PostWithDetails } from '@/types'

type PageProps = {
  params: { username: string }
}

export async function generateMetadata({ params }: PageProps) {
  const user = await db.user.findUnique({
    where: { username: params.username },
    select: { name: true, username: true, bio: true },
  })

  if (!user) return { title: 'Foydalanuvchi topilmadi' }

  return {
    title: `${user.name || user.username} (@${user.username}) • Uzstagram`,
    description: user.bio || `${user.username} profilini ko'rish`,
  }
}

export default async function ProfilePage({ params }: PageProps) {
  const session = await auth()

  const user = await db.user.findUnique({
    where: { username: params.username },
    select: {
      id: true,
      username: true,
      name: true,
      bio: true,
      avatar: true,
      website: true,
      email: true,
      createdAt: true,
      _count: {
        select: { posts: true, followers: true, following: true },
      },
      ...(session?.user?.id
        ? {
            followers: {
              where: { followerId: session.user.id },
              select: { id: true },
            },
          }
        : {}),
    },
  })

  if (!user) notFound()

  const isFollowing = session?.user?.id
    ? (user as any).followers?.length > 0
    : false

  const userProfile: UserProfile = {
    ...user,
    followers: undefined as any,
    isFollowing,
  }

  const posts = await db.post.findMany({
    where: { userId: user.id },
    include: {
      user: {
        select: { id: true, username: true, name: true, avatar: true },
      },
      likes: { select: { userId: true } },
      _count: { select: { likes: true, comments: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <ProfileHeader user={userProfile} />
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-border overflow-hidden">
        <PostGrid posts={posts as PostWithDetails[]} />
      </div>
    </div>
  )
}
