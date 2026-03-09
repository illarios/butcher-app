'use client'

import { useEffect, useState } from 'react'
import { isInstalled, isIOSSafari, shouldShowPrompt, dismissPrompt, recordVisit, useInstallPrompt } from '@/lib/pwa'

export default function InstallPrompt() {
  const [show, setShow]     = useState(false)
  const [isIOS, setIsIOS]   = useState(false)
  const { canInstall, prompt } = useInstallPrompt()

  useEffect(() => {
    recordVisit()

    // Delay check slightly so beforeinstallprompt has time to fire
    const timer = setTimeout(() => {
      if (!shouldShowPrompt()) return
      const ios = isIOSSafari()
      setIsIOS(ios)
      // On iOS we show manual instructions; on Android we need native prompt available
      if (ios || canInstall()) {
        setShow(true)
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleInstall = async () => {
    const accepted = await prompt()
    if (accepted) setShow(false)
  }

  const handleDismiss = () => {
    dismissPrompt()
    setShow(false)
  }

  if (!show) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-[60]"
        onClick={handleDismiss}
        aria-hidden="true"
      />

      {/* Bottom sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[61] bg-white shadow-2xl animate-in slide-in-from-bottom-4 duration-300"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        role="dialog"
        aria-modal="true"
        aria-label="Εγκατάσταση εφαρμογής"
      >
        <div className="max-w-lg mx-auto px-6 pt-6 pb-8">
          {/* Handle */}
          <div className="w-10 h-1 bg-[#EDE0D0] rounded-full mx-auto mb-6" />

          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            {/* App icon */}
            <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icons/icon-192x192.png" alt="Μάρκος" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2
                className="text-lg font-bold text-[#0D0D0D]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Κατεβάστε την εφαρμογή Μάρκος
              </h2>
              <p className="text-xs text-[#2E2E2E]/50 mt-0.5">kreopoleiomakros.gr</p>
            </div>
          </div>

          {/* Benefits */}
          <ul className="space-y-2 mb-6">
            {[
              'Άμεση πρόσβαση στις παραγγελίες σας',
              'Λειτουργεί και χωρίς internet',
              'Ειδοποιήσεις όταν η παραγγελία σας είναι έτοιμη',
            ].map((benefit) => (
              <li key={benefit} className="flex items-center gap-3 text-sm text-[#2E2E2E]">
                <span className="text-[#C8102E] font-bold flex-shrink-0">✓</span>
                {benefit}
              </li>
            ))}
          </ul>

          {isIOS ? (
            /* iOS manual instructions */
            <div className="bg-[#F5EFE6] border border-[#EDE0D0] p-4 mb-4">
              <p className="text-sm font-semibold text-[#2E2E2E] mb-3">
                Προσθέστε στην Αρχική Οθόνη:
              </p>
              <div className="flex items-start gap-3">
                {/* Animated arrow pointing to share icon */}
                <div className="flex-shrink-0 mt-0.5">
                  <svg
                    className="w-5 h-5 text-[#C8102E] animate-bounce"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <p className="text-sm text-[#2E2E2E]/70 leading-relaxed">
                  Πατήστε το{' '}
                  <span className="inline-flex items-center gap-1 font-semibold text-[#2E2E2E]">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M13 9V3H11v6H5l7 7 7-7h-6zM5 18v2h14v-2H5z"/>
                    </svg>
                    {' '}Κοινοποίηση
                  </span>{' '}
                  και μετά{' '}
                  <strong>&ldquo;Προσθήκη στην Αρχική Οθόνη&rdquo;</strong>.
                </p>
              </div>
            </div>
          ) : (
            /* Android/Chrome native install */
            <button
              onClick={handleInstall}
              className="w-full bg-[#C8102E] text-white text-xs uppercase tracking-widest py-4 hover:bg-[#8B0000] transition-colors mb-3"
            >
              Προσθήκη στην Αρχική
            </button>
          )}

          <button
            onClick={handleDismiss}
            className="w-full text-xs text-[#2E2E2E]/40 hover:text-[#2E2E2E]/70 py-2 transition-colors"
          >
            Όχι τώρα
          </button>
        </div>
      </div>
    </>
  )
}
