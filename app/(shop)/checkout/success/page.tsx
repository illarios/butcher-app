'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// ── Animated checkmark ────────────────────────────────────────────────────────
function AnimatedCheck() {
  return (
    <div className="flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mx-auto mb-6">
      <svg
        className="w-10 h-10 text-green-600"
        viewBox="0 0 52 52"
        fill="none"
        style={{ animation: 'dash 0.6s ease-in-out forwards' }}
      >
        <style>{`
          @keyframes dash {
            from { stroke-dashoffset: 100; opacity: 0; }
            to   { stroke-dashoffset: 0;   opacity: 1; }
          }
        `}</style>
        <circle cx="26" cy="26" r="25" stroke="#16a34a" strokeWidth="2" fill="none" opacity="0.3" />
        <path
          d="M14 27 L22 35 L38 19"
          stroke="#16a34a"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="100"
          strokeDashoffset="100"
          style={{ animation: 'dash 0.6s 0.2s ease-in-out forwards' }}
        />
      </svg>
    </div>
  )
}

// ── Toast notification ────────────────────────────────────────────────────────
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#2E2E2E] text-white text-sm px-6 py-3 shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-4">
      <span className="text-green-400">✓</span>
      {message}
      <button onClick={onClose} className="ml-2 opacity-50 hover:opacity-100 text-xs">✕</button>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function CheckoutSuccessPage() {
  return (
    <Suspense>
      <CheckoutSuccessContent />
    </Suspense>
  )
}

function CheckoutSuccessContent() {
  const params      = useSearchParams()
  const orderNumber = params.get('order') ?? ''
  const pointsEarned = Number(params.get('points') ?? 0)

  const [estimatedReady, setEstimatedReady] = useState<string | null>(null)
  const [toast, setToast]                   = useState<string | null>(null)
  const [orderId, setOrderId]               = useState<string | null>(null)
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null)

  // Fetch order id by order_number for realtime subscription
  useEffect(() => {
    if (!orderNumber) return
    const supabase = createClient()
    supabase
      .from('orders')
      .select('id, estimated_ready_at')
      .eq('order_number', orderNumber)
      .single()
      .then(({ data }) => {
        if (data) {
          setOrderId(data.id)
          if (data.estimated_ready_at) {
            setEstimatedReady(data.estimated_ready_at)
          }
        }
      })
  }, [orderNumber])

  // Realtime: listen for estimated_ready_at being set by admin
  useEffect(() => {
    if (!orderId) return
    const supabase = createClient()

    channelRef.current = supabase
      .channel(`order-ready-${orderId}`)
      .on(
        'postgres_changes',
        {
          event:  'UPDATE',
          schema: 'public',
          table:  'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          const newReady = payload.new?.estimated_ready_at
          if (newReady && newReady !== estimatedReady) {
            setEstimatedReady(newReady)
            const dt = new Date(newReady)
            const time = dt.toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' })
            setToast(`Η παραγγελία σας θα είναι έτοιμη στις ${time}!`)
          }
        }
      )
      .subscribe()

    return () => {
      channelRef.current?.unsubscribe()
    }
  }, [orderId, estimatedReady])

  const formatReadyTime = (iso: string) => {
    const dt = new Date(iso)
    return dt.toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <>
      <div className="min-h-screen bg-[#F5EFE6] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg">
          {/* Check animation */}
          <AnimatedCheck />

          {/* Heading */}
          <div className="text-center mb-8">
            <h1
              className="text-3xl font-bold text-[#2E2E2E] mb-2"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Η παραγγελία σας ελήφθη!
            </h1>
            <p className="text-[#2E2E2E]/60 text-sm">
              Ευχαριστούμε για την εμπιστοσύνη σας.
            </p>
          </div>

          {/* Order number card */}
          <div className="bg-white border border-[#EDE0D0] p-6 mb-4 text-center">
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#2E2E2E]/40 mb-2">
              Αριθμός παραγγελίας
            </p>
            <p
              className="text-3xl font-bold text-[#C8102E]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {orderNumber}
            </p>
          </div>

          {/* Status card */}
          <div className="bg-white border border-[#EDE0D0] p-6 mb-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔔</span>
              <div>
                <p className="font-semibold text-[#2E2E2E] text-sm">Ο Μάρκος θα επιβεβαιώσει σύντομα.</p>
                <p className="text-xs text-[#2E2E2E]/60 mt-1 leading-relaxed">
                  Μόλις επιβεβαιωθεί η παραγγελία σας, θα λάβετε email με τον εκτιμώμενο χρόνο ετοιμότητας.
                </p>
              </div>
            </div>

            {/* Estimated ready time (realtime) */}
            {estimatedReady && (
              <div className="mt-4 flex items-center gap-2 text-sm bg-green-50 border border-green-200 text-green-800 px-4 py-3">
                <span className="text-green-600 font-bold">✓</span>
                <span>
                  Εκτιμώμενη ετοιμότητα: <strong>{formatReadyTime(estimatedReady)}</strong>
                </span>
              </div>
            )}
          </div>

          {/* Loyalty points badge */}
          {pointsEarned > 0 && (
            <div className="bg-[#C8102E]/10 border border-[#C8102E]/30 p-4 mb-4 flex items-center gap-3">
              <span className="text-2xl">✦</span>
              <p className="text-sm text-[#C8102E]">
                Κερδίσατε <strong>{pointsEarned} πόντους</strong> επιβράβευσης!
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            {orderId && (
              <Link
                href={`/account/orders/${orderId}`}
                className="flex-1 block text-center bg-[#C8102E] text-white text-xs uppercase tracking-widest py-4 hover:bg-[#8B0000] transition-colors"
              >
                Δείτε την παραγγελία σας
              </Link>
            )}
            <Link
              href="/products"
              className="flex-1 block text-center border border-[#EDE0D0] text-[#2E2E2E] text-xs uppercase tracking-widest py-4 hover:border-[#C8102E] hover:text-[#C8102E] transition-colors bg-white"
            >
              Συνεχίστε τις αγορές
            </Link>
          </div>
        </div>
      </div>

      {/* Toast notification */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  )
}
