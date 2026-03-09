'use client'

import { useEffect, useState } from 'react'

// Only shown when running as an installed PWA (standalone mode)
export default function SplashScreen() {
  const [visible, setVisible] = useState(false)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true)

    if (!isStandalone) return
    if (sessionStorage.getItem('splash-shown')) return

    sessionStorage.setItem('splash-shown', '1')
    setVisible(true)

    const fadeTimer = setTimeout(() => setFading(true), 1400)
    const hideTimer = setTimeout(() => setVisible(false), 1900)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(hideTimer)
    }
  }, [])

  if (!visible) return null

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#0D0D0D] transition-opacity duration-500 ${
        fading ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Photo — circular, subtle */}
      <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-[#C8102E]/40 mb-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/brand/markos-butcher.jpg"
          alt="Κρεοπωλείο Μάρκος"
          className="w-full h-full object-cover object-top"
        />
      </div>

      {/* Brand name */}
      <p
        className="text-white text-2xl font-bold tracking-wide"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Κρεοπωλείο Μάρκος
      </p>
      <p className="text-white/30 text-[10px] uppercase tracking-[0.3em] mt-1">
        Φρέσκο κρέας από το 1993
      </p>

      {/* Brand red line */}
      <div className="w-8 h-0.5 bg-[#C8102E] mt-5" />
    </div>
  )
}
