'use client'

import { useState } from 'react'
import type { Order, OrderStatus } from '@/types'

interface Props {
  order: Order & {
    profiles?: { full_name?: string; phone?: string }
    delivery_zones?: { name?: string }
  }
  onClose: () => void
  onStatusChange: (orderId: string, status: OrderStatus) => void
  onConfirm: (updated: Order) => void
}

const STATUS_ACTIONS: { status: OrderStatus; label: string; color: string }[] = [
  { status: 'confirmed',        label: 'Επιβεβαιωμένη',  color: 'bg-blue-600 hover:bg-blue-700'     },
  { status: 'preparing',        label: 'Ετοιμάζεται',    color: 'bg-purple-600 hover:bg-purple-700' },
  { status: 'ready',            label: 'Έτοιμη',         color: 'bg-green-600 hover:bg-green-700'   },
  { status: 'out_for_delivery', label: 'Εστάλη',         color: 'bg-indigo-600 hover:bg-indigo-700' },
  { status: 'delivered',        label: 'Παραδόθηκε',     color: 'bg-gray-700 hover:bg-gray-800'     },
  { status: 'cancelled',        label: 'Ακύρωση',        color: 'bg-red-600 hover:bg-red-700'       },
]

const QUICK_TIMES: { label: string; minutes: number }[] = [
  { label: '30 λεπτά',   minutes: 30  },
  { label: '1 ώρα',      minutes: 60  },
  { label: '1.5 ώρα',   minutes: 90  },
  { label: '2 ώρες',    minutes: 120 },
]

function formatWeight(g: number) {
  return g >= 1000 ? `${(g / 1000).toFixed(2).replace('.', ',')} kg` : `${g} g`
}
function formatPrice(n: number) {
  return Number(n).toFixed(2).replace('.', ',') + '€'
}

export default function OrderPanel({ order, onClose, onStatusChange, onConfirm }: Props) {
  const [submitting, setSubmitting]     = useState(false)
  const [selectedQuick, setSelectedQuick] = useState<number | null>(null)
  const [customTime, setCustomTime]     = useState('')
  const [adminNote, setAdminNote]       = useState(order.admin_note ?? '')
  const [tomorrowMorning, setTomorrowMorning] = useState(false)
  const isDelivery = order.fulfillment_type === 'delivery'

  const getReadyAt = (): string | null => {
    if (tomorrowMorning) {
      const d = new Date()
      d.setDate(d.getDate() + 1)
      d.setHours(9, 0, 0, 0)
      return d.toISOString()
    }
    if (selectedQuick !== null) {
      return new Date(Date.now() + selectedQuick * 60000).toISOString()
    }
    if (customTime) {
      return new Date(customTime).toISOString()
    }
    return null
  }

  const handleConfirm = async () => {
    const readyAt = getReadyAt()
    if (!readyAt) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/confirm`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estimated_ready_at: readyAt, admin_note: adminNote || null }),
      })
      if (res.ok) {
        const data = await res.json()
        onConfirm({ ...order, ...data.order })
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white z-50 flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDE0D0] bg-[#F5EFE6]">
          <div>
            <p className="font-bold text-[#C8102E] text-lg" style={{ fontFamily: 'var(--font-display)' }}>
              {order.order_number}
            </p>
            <p className="text-xs text-[#2E2E2E]/50 mt-0.5">
              {new Date(order.created_at).toLocaleString('el-GR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <button onClick={onClose} className="text-2xl text-[#2E2E2E]/40 hover:text-[#2E2E2E] transition-colors">✕</button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">

          {/* Customer info */}
          <div className="px-6 py-4 border-b border-[#EDE0D0]">
            <p className="text-[10px] uppercase tracking-widest text-[#2E2E2E]/40 mb-2">Πελάτης</p>
            <p className="font-semibold text-[#2E2E2E]">{(order as any).profiles?.full_name ?? '—'}</p>
            {(order as any).profiles?.phone && (
              <a href={`tel:${(order as any).profiles.phone}`} className="text-sm text-[#C8102E] hover:underline">
                📞 {(order as any).profiles.phone}
              </a>
            )}
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 ${
                isDelivery ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {isDelivery ? 'DELIVERY' : 'ΠΑΡΑΛΑΒΗ'}
              </span>
              <span className="text-[10px] text-[#2E2E2E]/50">💵 Πληρωμή κατά παραλαβή</span>
            </div>
          </div>

          {/* Delivery address */}
          {isDelivery && order.delivery_address && (
            <div className="px-6 py-4 border-b border-[#EDE0D0]">
              <p className="text-[10px] uppercase tracking-widest text-[#2E2E2E]/40 mb-2">Διεύθυνση</p>
              {(order as any).delivery_zones?.name && (
                <p className="text-xs text-[#C8102E] mb-1">📍 {(order as any).delivery_zones.name}</p>
              )}
              <address className="not-italic text-sm text-[#2E2E2E]/80">
                {(order.delivery_address as any).street} {(order.delivery_address as any).number}
                {(order.delivery_address as any).floor && `, ${(order.delivery_address as any).floor}ος`}
                <br />{(order.delivery_address as any).city} {(order.delivery_address as any).postal_code}
              </address>
            </div>
          )}

          {/* Items */}
          <div className="px-6 py-4 border-b border-[#EDE0D0]">
            <p className="text-[10px] uppercase tracking-widest text-[#2E2E2E]/40 mb-3">Προϊόντα</p>
            <ul className="space-y-3">
              {order.items.map((item, i) => (
                <li key={i} className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#2E2E2E]">{item.product_name}</p>
                    {item.cut_name && <p className="text-xs text-[#2E2E2E]/50">Κόψιμο: {item.cut_name}</p>}
                    <p className="text-xs text-[#2E2E2E]/50">{formatWeight(item.weight_grams)}</p>
                    {item.notes && <p className="text-xs italic text-[#2E2E2E]/40 mt-0.5">"{item.notes}"</p>}
                  </div>
                  <p className="text-sm font-bold text-[#2E2E2E] shrink-0">{formatPrice(item.line_total)}</p>
                </li>
              ))}
            </ul>
            {/* Totals */}
            <dl className="mt-4 pt-3 border-t border-[#EDE0D0] space-y-1 text-xs">
              <div className="flex justify-between text-[#2E2E2E]/60">
                <dt>Υποσύνολο</dt><dd>{formatPrice(order.subtotal)}</dd>
              </div>
              {order.delivery_fee > 0 && (
                <div className="flex justify-between text-[#2E2E2E]/60">
                  <dt>Μεταφορικά</dt><dd>{formatPrice(order.delivery_fee)}</dd>
                </div>
              )}
              {order.loyalty_discount > 0 && (
                <div className="flex justify-between text-green-700">
                  <dt>Loyalty</dt><dd>−{formatPrice(order.loyalty_discount)}</dd>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm pt-1">
                <dt>Σύνολο</dt><dd className="text-[#C8102E]">{formatPrice(order.total)}</dd>
              </div>
            </dl>
          </div>

          {/* ── Time Confirmation ─────────────────────────────── */}
          <div className="px-6 py-5 border-b border-[#EDE0D0] bg-[#F5EFE6]">
            <p className="text-xs font-bold text-[#2E2E2E] uppercase tracking-widest mb-4">
              Επιβεβαίωση Χρόνου Ετοιμότητας
            </p>

            {order.estimated_ready_at ? (
              <div className="bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800 mb-4">
                ✓ Ήδη επιβεβαιωμένη:{' '}
                <strong>
                  {new Date(order.estimated_ready_at).toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' })}
                </strong>
                {order.admin_note && <p className="text-xs mt-1 text-green-700/70">"{order.admin_note}"</p>}
              </div>
            ) : null}

            {/* Quick-select buttons */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              {QUICK_TIMES.map((qt) => (
                <button
                  key={qt.minutes}
                  type="button"
                  onClick={() => { setSelectedQuick(qt.minutes); setCustomTime(''); setTomorrowMorning(false) }}
                  className={`text-sm py-2.5 border font-medium transition-colors ${
                    selectedQuick === qt.minutes && !tomorrowMorning
                      ? 'bg-[#C8102E] text-white border-[#C8102E]'
                      : 'bg-white text-[#2E2E2E] border-[#EDE0D0] hover:border-[#C8102E]'
                  }`}
                >
                  {qt.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => { setTomorrowMorning(true); setSelectedQuick(null); setCustomTime('') }}
                className={`col-span-2 text-sm py-2.5 border font-medium transition-colors ${
                  tomorrowMorning
                    ? 'bg-[#C8102E] text-white border-[#C8102E]'
                    : 'bg-white text-[#2E2E2E] border-[#EDE0D0] hover:border-[#C8102E]'
                }`}
              >
                Αύριο πρωί (09:00)
              </button>
            </div>

            {/* Custom time picker */}
            <div className="mb-3">
              <label className="block text-[10px] uppercase tracking-widest text-[#2E2E2E]/50 mb-1.5">
                Ή επιλέξτε συγκεκριμένη ώρα
              </label>
              <input
                type="datetime-local"
                value={customTime}
                onChange={(e) => { setCustomTime(e.target.value); setSelectedQuick(null); setTomorrowMorning(false) }}
                className="w-full border border-[#EDE0D0] bg-white px-3 py-2 text-sm focus:outline-none focus:border-[#C8102E]"
              />
            </div>

            {/* Admin note */}
            <div className="mb-4">
              <label className="block text-[10px] uppercase tracking-widest text-[#2E2E2E]/50 mb-1.5">
                Μήνυμα προς τον πελάτη (προαιρετικό)
              </label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value.slice(0, 300))}
                rows={2}
                placeholder="Πχ: Θα σας καλέσουμε πριν φύγει ο διανομέας"
                className="w-full border border-[#EDE0D0] bg-white px-3 py-2 text-sm resize-none focus:outline-none focus:border-[#C8102E] placeholder:text-[#2E2E2E]/30"
              />
              <p className="text-[10px] text-[#2E2E2E]/30 text-right mt-0.5">{adminNote.length}/300</p>
            </div>

            {/* Confirm button */}
            <button
              onClick={handleConfirm}
              disabled={submitting || (!selectedQuick && !customTime && !tomorrowMorning)}
              className="w-full bg-[#C8102E] text-white text-xs uppercase tracking-widest py-3 hover:bg-[#8B0000] transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-semibold"
            >
              {submitting ? 'Αποστολή...' : 'Αποστολή Επιβεβαίωσης'}
            </button>
          </div>

          {/* ── Status change buttons ─────────────────────────── */}
          <div className="px-6 py-5">
            <p className="text-[10px] uppercase tracking-widest text-[#2E2E2E]/40 mb-3">Αλλαγή κατάστασης</p>
            <div className="grid grid-cols-2 gap-2">
              {STATUS_ACTIONS.map((sa) => (
                <button
                  key={sa.status}
                  onClick={() => onStatusChange(order.id, sa.status)}
                  disabled={order.status === sa.status}
                  className={`text-white text-xs py-2 font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${sa.color}`}
                >
                  {sa.label}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
