import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { ProfileSettings } from '@/components/profile/ProfileSettings'

export const metadata = {
  title: 'Profil sozlamalari • Uzstagram',
}

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const user = await db.user.findUnique({
    where: { id: session.user.id as string },
    select: {
      id: true,
      name: true,
      username: true,
      bio: true,
      website: true,
      avatar: true,
      email: true,
    },
  })

  if (!user) redirect('/login')

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-6">Sozlamalar</h1>
      <ProfileSettings user={user} />
    </div>
  )
}
