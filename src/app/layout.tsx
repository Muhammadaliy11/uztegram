import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { Providers } from '@/components/Providers'

export const metadata: Metadata = {
  title: 'Uzstagram',
  description: "O'zbek ijtimoiy tarmoq - rasm va videolarni do'stlar bilan ulashing",
  keywords: ['uzstagram', 'ijtimoiy tarmoq', 'rasm', 'video', 'uzbekistan'],
  openGraph: {
    title: 'Uzstagram',
    description: "O'zbek ijtimoiy tarmoq",
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <body>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
