import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: 'PIYUSH.DEV — AI & ML Developer | Explore My City',
  description: 'Explore the world of Piyush: AI and ML developer, engineering student, and problem solver. An interactive city of projects, ideas, and possibilities.',
  generator: 'v0.app',
  icons: { icon: { url: '/icon.svg', type: 'image/svg+xml' } },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#050711',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`bg-background ${geist.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
