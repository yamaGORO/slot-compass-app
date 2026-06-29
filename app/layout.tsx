import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Noto_Sans_JP } from 'next/font/google'
import BottomNav from '@/components/layout/BottomNav'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })
const notoSansJP = Noto_Sans_JP({
  variable: '--font-noto-jp',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
})
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

export const metadata: Metadata = {
  title: 'Slot Compass — 期待値ナビゲーター',
  description: 'パチスロ実戦データから期待値と予想設定を高精度に算出する個人用分析ツール',
  generator: 'v0.app',
  applicationName: 'Slot Compass',
  manifest: `${basePath}/manifest.webmanifest`,
  keywords: ['パチスロ', '期待値', '設定推測', 'スマスロ', 'ジャグラー'],
  authors: [{ name: 'Slot Compass' }],
  icons: {
    icon: [
      { url: `${basePath}/icon-dark-32x32.png`, sizes: '32x32', type: 'image/png', media: '(prefers-color-scheme: light)' },
      { url: `${basePath}/icon-light-32x32.png`, sizes: '32x32', type: 'image/png', media: '(prefers-color-scheme: dark)' },
      { url: `${basePath}/icon.svg`, type: 'image/svg+xml' },
    ],
    apple: [{ url: `${basePath}/apple-touch-icon.png`, sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: {
    capable: true,
    title: 'Slot Compass',
    statusBarStyle: 'black-translucent',
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#080808',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} ${notoSansJP.variable} bg-[#080808]`}
    >
      <body className="font-sans antialiased bg-[#080808] text-white min-h-screen">
        {/* Max-width container centered for larger screens, full-width for mobile */}
        <div className="mx-auto max-w-[430px] relative min-h-screen">
          <main className="pb-20">
            {children}
          </main>
          <BottomNav />
        </div>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
