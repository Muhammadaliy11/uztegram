import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import Link from 'next/link'
import Image from 'next/image'
import { Avatar } from '@/components/ui/avatar-component'
import { timeAgo } from '@/lib/utils'
import { Heart, MessageCircle, UserPlus } from 'lucide-react'

export const metadata = {
  title: 'Bildirishnomalar • Uzstagram',
}

const notifIcons = {
  like: <Heart size={16} className="text-red-500 fill-red-500" />,
  comment: <MessageCircle size={16} className="text-blue-500" />,
  follow: <UserPlus size={16} className="text-green-500" />,
}

const notifText = {
  like: 'postingizni yoqtirdi',
  comment: 'postingizga izoh yozdi',
  follow: 'sizga obuna bo\'ldi',
}

export default async function NotificationsPage() {
  const session = await auth()

  const notifications = await db.notification.findMany({
    where: { toId: session!.user!.id as string },
    include: {
      from: {
        select: { id: true, username: true, name: true, avatar: true },
      },
      post: {
        select: { id: true, mediaUrl: true, mediaType: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  // Mark as read
  await db.notification.updateMany({
    where: { toId: session!.user!.id as string, read: false },
    data: { read: true },
  })

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Bildirishnomalar</h1>

      {notifications.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground bg-white dark:bg-gray-900 rounded-2xl border border-border">
          <p className="text-4xl mb-3">🔔</p>
          <p>Hali bildirishnoma yo&apos;q</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-border overflow-hidden divide-y divide-border">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`flex items-center gap-3 p-4 transition-colors ${
                !notif.read ? 'bg-blue-50/50 dark:bg-blue-950/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
            >
              <Link href={`/profile/${notif.from.username}`}>
                <Avatar
                  src={notif.from.avatar}
                  name={notif.from.name || notif.from.username}
                  size={44}
                />
              </Link>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <Link href={`/profile/${notif.from.username}`} className="font-semibold hover:underline">
                    {notif.from.username}
                  </Link>{' '}
                  {notifText[notif.type as keyof typeof notifText]}
                </p>
                <p className="text-xs text-muted-foreground">{timeAgo(notif.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                {notifIcons[notif.type as keyof typeof notifIcons]}
                {notif.post && (
                  <Link href={`/post/${notif.post.id}`}>
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={notif.post.mediaUrl}
                        alt="Post"
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
