import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import { AudioProvider } from '@/components/AudioProvider'
import { PWARegistration } from '@/components/PWARegistration'
import GlobalAlarm from '@/components/GlobalAlarm'

export const metadata: Metadata = {
  title: 'Solo Leveling: System',
  description: 'Arise. Complete quests. Build your Shadow Army.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Orbitron:wght@400;500;600;700;800;900&family=Rajdhani:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#7c3aed" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body>
        <AuthProvider>
          <AudioProvider>
            <PWARegistration />
            <GlobalAlarm />
            {children}
          </AudioProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
