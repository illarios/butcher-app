'use client'

import { useState } from 'react'
import { shouldShowPushBanner, dismissPushBanner, subscribeToPush } from '@/lib/pwa'

export default function NotificationPermissionBanner() {
  const [show, setShow]     = useState(() => {
    if (typeof window === 'undefined') return false
    return shouldShowPushBanner()
  })
  const [loading, setLoading] = useState(false)

  const handleEnable = async () => {
    setLoading(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setShow(false)
        return
      }

      const subscription = await subscribeToPush()
      if (subscription) {
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription }),
        })
      }
    } catch {
      // Silently fail — non-critical feature
    } finally {
      setShow(false)
    }
  }

  const handleDismiss = () => {
    dismissPushBanner()
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[59] bg-white border-t border-[#EDE0D0] shadow-lg animate-in slide-in-from-bottom-4 duration-300"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="max-w-lg mx-auto px-4 py-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0 mt-0.5">🔔</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#2E2E2E]">
              Θέλετε να ενημερώνεστε για την παραγγελία σας;
            </p>
            <p className="text-xs text-[#2E2E2E]/60 mt-0.5 leading-relaxed">
              Θα λαμβάνετε ειδοποίηση όταν η παραγγελία σας είναι έτοιμη.
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={handleEnable}
            disabled={loading}
            className="flex-1 bg-[#C8102E] text-white text-xs uppercase tracking-widest py-3 hover:bg-[#8B0000] transition-colors disabled:opacity-50"
          >
            {loading ? 'Ενεργοποίηση…' : 'Ενεργοποίηση ειδοποιήσεων'}
          </button>
          <button
            onClick={handleDismiss}
            className="px-4 py-3 text-xs text-[#2E2E2E]/50 hover:text-[#2E2E2E] border border-[#EDE0D0] transition-colors"
          >
            Όχι ευχαριστώ
          </button>
        </div>
      </div>
    </div>
  )
}
