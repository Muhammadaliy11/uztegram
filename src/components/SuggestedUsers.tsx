import { db } from '@/lib/db'
import Link from 'next/link'
import { Avatar } from '@/components/ui/avatar-component'

async function getSuggestedUsers(currentUserId: string) {
  const following = await db.follow.findMany({
    where: { followerId: currentUserId },
    select: { followingId: true },
  })

  const followingIds = following.map((f) => f.followingId)

  return db.user.findMany({
    where: {
      id: { notIn: [...followingIds, currentUserId] },
    },
    select: {
      id: true,
      username: true,
      name: true,
      avatar: true,
      _count: { select: { followers: true } },
    },
    orderBy: { followers: { _count: 'desc' } },
    take: 5,
  })
}

export async function SuggestedUsers({ currentUserId }: { currentUserId: string }) {
  const users = await getSuggestedUsers(currentUserId)

  if (users.length === 0) return null

  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">
        Tavsiya etilgan
      </p>
      <div className="space-y-3">
        {users.map((user) => (
          <div key={user.id} className="flex items-center gap-3">
            <Link href={`/profile/${user.username}`}>
              <Avatar src={user.avatar} name={user.name || user.username} size={36} />
            </Link>
            <div className="flex-1 min-w-0">
              <Link href={`/profile/${user.username}`} className="font-semibold text-sm hover:underline block truncate">
                {user.username}
              </Link>
              <p className="text-xs text-muted-foreground">{user._count.followers} obunachi</p>
            </div>
            <Link
              href={`/profile/${user.username}`}
              className="text-xs font-semibold text-blue-500 hover:text-blue-600"
            >
              Ko&apos;rish
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
