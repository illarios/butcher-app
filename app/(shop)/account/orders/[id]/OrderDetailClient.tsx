'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useCartStore } from '@/lib/stores/cart'
import type { Order, OrderStatus } from '@/types'
import { STATUS_CONFIG, formatPrice, formatWeight } from './order-utils'

interface StatusLogEntry {
  id: string
  order_id: string
  status: OrderStatus
  note?: string
  created_at: string
}

interface Props {
  order: Order
  statusLog: StatusLogEntry[]
}

// ── Toast ──────────────────────────────────────────────────────────────────────
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

// ── Main client component ──────────────────────────────────────────────────────
export default function OrderDetailClient({ order: initialOrder, statusLog: initialLog }: Props) {
  const [order, setOrder]     = useState(initialOrder)
  const [toast, setToast]     = useState<string | null>(null)
  const [reordering, setReordering] = useState(false)
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null)
  const addItem    = useCartStore((s) => s.addItem)

  const showToast = useCallback((msg: string) => setToast(msg), [])

  // ── Realtime subscription ──────────────────────────────────────────────────
  useEffect(() => {
    const supabase = createClient()

    channelRef.current = supabase
      .channel(`order-detail-${order.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${order.id}` },
        (payload) => {
          const updated = payload.new as Partial<Order>
          setOrder((prev) => ({ ...prev, ...updated }))

          if (updated.estimated_ready_at && updated.estimated_ready_at !== order.estimated_ready_at) {
            const time = new Date(updated.estimated_ready_at).toLocaleTimeString('el-GR', {
              hour: '2-digit', minute: '2-digit',
            })
            showToast(`Η παραγγελία σας θα είναι έτοιμη στις ${time}!`)
          }

          if (updated.status && updated.status !== order.status) {
            const cfg = STATUS_CONFIG[updated.status as OrderStatus]
            showToast(cfg?.description ?? 'Η κατάσταση της παραγγελίας ενημερώθηκε.')
          }
        }
      )
      .subscribe()

    return () => { channelRef.current?.unsubscribe() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order.id])

  // ── Reorder ────────────────────────────────────────────────────────────────
  const handleReorder = () => {
    setReordering(true)
    try {
      order.items.forEach((item) => {
        addItem({
          productId:       item.product_id,
          productName:     item.product_name,
          weightGrams:     item.weight_grams,
          pricePerKg:      item.price_per_kg,
          extraPricePerKg: item.extra_price_per_kg,
          notes:           item.notes,
        })
      })
      showToast(`${order.items.length} προϊόντα προστέθηκαν στο καλάθι!`)
    } finally {
      setReordering(false)
    }
  }

  // ── Estimated ready block ──────────────────────────────────────────────────
  const formatReadyTime = (iso: string) => {
    const dt   = new Date(iso)
    const now  = new Date()
    const isToday = dt.toDateString() === now.toDateString()
    const time = dt.toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' })
    return isToday ? `Σήμερα στις ${time}` : `${dt.toLocaleDateString('el-GR', { weekday: 'long' })} στις ${time}`
  }

  const showReadyBlock = !['delivered', 'cancelled'].includes(order.status)

  return (
    <>
      {/* ── Estimated Ready / Pending confirmation block ── */}
      {showReadyBlock && (
        <div className={`border p-5 ${
          order.estimated_ready_at
            ? 'bg-green-50 border-green-200'
            : 'bg-amber-50 border-amber-200'
        }`}>
          {order.estimated_ready_at ? (
            <div className="flex items-start gap-3">
              <span className="text-2xl text-green-600">✓</span>
              <div>
                <p className="font-semibold text-green-800 text-sm">Η παραγγελία σας θα είναι έτοιμη:</p>
                <p className="text-2xl font-bold text-green-700 mt-1" style={{ fontFamily: 'var(--font-display)' }}>
                  {formatReadyTime(order.estimated_ready_at)}
                </p>
                <p className="text-xs text-green-700/70 mt-1">
                  {order.fulfillment_type === 'pickup'
                    ? '🏪 Σας περιμένουμε στο κατάστημα!'
                    : '🚚 Ο διανομέας θα φτάσει γύρω στην παραπάνω ώρα.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <span className="relative flex w-3 h-3 shrink-0 mt-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full w-3 h-3 bg-amber-400" />
              </span>
              <div>
                <p className="font-semibold text-amber-800 text-sm">Αναμένεται επιβεβαίωση από τον Μάρκο...</p>
                <p className="text-xs text-amber-700/70 mt-1">
                  Μόλις επιβεβαιωθεί η παραγγελία σας θα ενημερωθείτε αμέσως.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Admin note ─────────────────────────────────────── */}
      {order.admin_note && (
        <div className="bg-[#F5EFE6] border border-[#EDE0D0] p-5 flex items-start gap-3">
          <span className="text-2xl shrink-0">✉️</span>
          <div>
            <p className="text-xs font-bold text-[#2E2E2E] uppercase tracking-widest mb-1">
              Μήνυμα από τον Μάρκο:
            </p>
            <p className="text-sm text-[#2E2E2E]/80 leading-relaxed">{order.admin_note}</p>
          </div>
        </div>
      )}

      {/* ── Reorder button ─────────────────────────────────── */}
      <div className="flex justify-end">
        <button
          onClick={handleReorder}
          disabled={reordering}
          className="inline-flex items-center gap-2 border border-[#2E2E2E] text-[#2E2E2E] text-xs uppercase tracking-widest px-5 py-2.5 hover:bg-[#2E2E2E] hover:text-white transition-colors disabled:opacity-50"
        >
          ↺ Επαναπαραγγελία
        </button>
      </div>

      {/* ── Toast ──────────────────────────────────────────── */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  )
}
