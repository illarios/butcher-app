'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useCartStore } from '@/lib/stores/cart'

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const items = useCartStore((s) => s.items)

  useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      setShowToast(true)
      setTimeout(() => setShowToast(false), 5000)
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#F5EFE6] flex flex-col items-center justify-center px-6 py-16">
      {/* Logo */}
      <div className="mb-8 text-center">
        <span
          className="text-2xl font-bold tracking-widest uppercase text-[#C8102E]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          ΚΡΕΟΠΩΛΕΙΟ ΜΑΡΚΟΣ
        </span>
      </div>

      {/* Meat illustration */}
      <div className="text-8xl mb-8 select-none" role="img" aria-label="Κρέας">🥩</div>

      <div className="text-center max-w-sm">
        <h1
          className="text-2xl font-bold text-[#2E2E2E] mb-3"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {isOnline ? 'Επανήλθατε online!' : 'Δεν υπάρχει σύνδεση αυτή τη στιγμή.'}
        </h1>
        <p className="text-sm text-[#2E2E2E]/60 mb-8 leading-relaxed">
          {isOnline
            ? 'Η σύνδεσή σας αποκαταστάθηκε. Μπορείτε να συνεχίσετε τις αγορές σας.'
            : 'Ελέγξτε την σύνδεσή σας στο internet και προσπαθήστε ξανά.'}
        </p>

        <button
          onClick={() => window.location.reload()}
          className="w-full bg-[#C8102E] text-white text-xs uppercase tracking-widest py-4 hover:bg-[#8B0000] transition-colors mb-4"
        >
          Δοκιμάστε ξανά
        </button>

        <Link
          href="/"
          className="block w-full border border-[#EDE0D0] text-[#2E2E2E] text-xs uppercase tracking-widest py-4 text-center hover:border-[#C8102E] hover:text-[#C8102E] transition-colors bg-white"
        >
          Αρχική σελίδα
        </Link>
      </div>

      {/* Cached cart items */}
      {items.length > 0 && (
        <div className="mt-12 w-full max-w-sm">
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#2E2E2E]/40 mb-4 text-center">
            Αποθηκευμένο καλάθι ({items.length} {items.length === 1 ? 'προϊόν' : 'προϊόντα'})
          </p>
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.key}
                className="bg-white border border-[#EDE0D0] px-4 py-3 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-[#2E2E2E]">{item.productName}</p>
                  {item.cutName && (
                    <p className="text-xs text-[#2E2E2E]/50">{item.cutName}</p>
                  )}
                </div>
                <p className="text-xs text-[#2E2E2E]/60">{item.weightGrams}g</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#2E2E2E]/40 text-center mt-3">
            Το καλάθι σας θα αποθηκευτεί αυτόματα όταν επανέλθετε online.
          </p>
        </div>
      )}

      {/* Online toast */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#2E2E2E] text-white text-sm px-6 py-3 shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-4">
          <span className="text-green-400">✓</span>
          Επανήλθατε online! Το καλάθι σας αποθηκεύτηκε.
        </div>
      )}
    </div>
  )
}
