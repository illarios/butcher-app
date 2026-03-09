import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Lato } from 'next/font/google'
import './globals.css'

const playfairDisplay = Playfair_Display({
  variable: '--font-display',
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
})

const lato = Lato({
  variable: '--font-body',
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '700', '900'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Κρεοπωλείο Μάρκος — Φρέσκο κρέας, απευθείας σε σας',
  description:
    'Παραγγείλτε φρέσκο κρέας online από το κρεοπωλείο Μάρκος. Άμεση παράδοση στο σπίτι σας.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Μάρκος',
  },
  icons: {
    apple: '/icons/icon-192x192.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#C8102E',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="el" className={`${playfairDisplay.variable} ${lato.variable}`}>
      <body className="antialiased">
        {/* Grain texture overlay */}
        <div
          aria-hidden="true"
          className="fixed inset-0 pointer-events-none z-50 bg-grain opacity-[0.035]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
            backgroundRepeat: 'repeat',
            backgroundSize: '128px 128px',
          }}
        />
        {children}
      </body>
    </html>
  )
}
