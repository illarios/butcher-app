'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Order, OrderStatus } from '@/types'
import OrderPanel from './OrderPanel'

interface Column { status: OrderStatus; label: string; color: string }

interface Props {
  initialByStatus: Record<string, Order[]>
  columns: Column[]
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function timeSince(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 1)  return 'μόλις τώρα'
  if (mins < 60) return `${mins} λεπτά πριν`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs} ώρα${hrs > 1 ? 'ές' : ''} πριν`
  return `${Math.floor(hrs / 24)} μέρες πριν`
}

function totalWeight(items: Order['items']) {
  return items.reduce((s, i) => s + i.weight_grams, 0)
}

function formatWeight(g: number) {
  return g >= 1000 ? `${(g / 1000).toFixed(1)}kg` : `${g}g`
}

function formatPrice(n: number) {
  return n.toFixed(2).replace('.', ',') + '€'
}

// ── Order Card ─────────────────────────────────────────────────────────────────
function OrderCard({ order, onClick }: { order: Order & { profiles?: { full_name?: string; phone?: string }; delivery_zones?: { name?: string } }; onClick: () => void }) {
  const isDelivery = order.fulfillment_type === 'delivery'
  return (
    <div
      onClick={onClick}
      className="bg-white border border-[#EDE0D0] hover:border-[#C8102E] cursor-pointer transition-colors p-3 space-y-2"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <p className="font-bold text-[#C8102E] text-xs" style={{ fontFamily: 'var(--font-display)' }}>
          {order.order_number}
        </p>
        <span className={`text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 ${
          isDelivery ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
        }`}>
          {isDelivery ? 'DELIVERY' : 'ΠΑΡΑΛΑΒΗ'}
        </span>
      </div>

      {/* Customer */}
      <p className="text-xs text-[#2E2E2E] font-medium truncate">
        {(order as any).profiles?.full_name ?? '—'}
      </p>

      {/* Delivery zone */}
      {isDelivery && (order as any).delivery_zones?.name && (
        <p className="text-[10px] text-[#2E2E2E]/50 truncate">
          📍 {(order as any).delivery_zones.name}
          {order.delivery_address && `, ${(order.delivery_address as any).street} ${(order.delivery_address as any).number}`}
        </p>
      )}

      {/* Items summary */}
      <p className="text-[10px] text-[#2E2E2E]/60">
        {order.items.length} τεμ. · {formatWeight(totalWeight(order.items))} · {formatPrice(order.total)}
      </p>

      {/* Time + payment */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-[#2E2E2E]/40">{timeSince(order.created_at)}</p>
        <p className="text-[10px] text-[#2E2E2E]/40">💵 ΠΚΠ</p>
      </div>

      {/* Estimated ready */}
      {order.estimated_ready_at ? (
        <p className="text-[10px] text-green-700 bg-green-50 px-2 py-1">
          ✓ Έτοιμο {new Date(order.estimated_ready_at).toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' })}
        </p>
      ) : (
        <p className="text-[10px] text-amber-700 bg-amber-50 px-2 py-1">
          ⏳ Εκκρεμεί επιβεβαίωση
        </p>
      )}
    </div>
  )
}

// ── Kanban column ──────────────────────────────────────────────────────────────
function KanbanColumn({ col, orders, onCardClick }: {
  col: Column
  orders: Order[]
  onCardClick: (order: Order) => void
}) {
  return (
    <div className="flex flex-col min-w-[220px] w-[220px]">
      <div className={`flex items-center justify-between px-3 py-2 bg-white border-t-2 border-b border-[#EDE0D0] ${col.color} mb-2`}>
        <span className="text-xs font-bold text-[#2E2E2E] uppercase tracking-wider">{col.label}</span>
        <span className="text-[10px] bg-[#F5EFE6] text-[#2E2E2E]/60 px-1.5 py-0.5 font-bold">
          {orders.length}
        </span>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto max-h-[calc(100vh-180px)] pr-1">
        {orders.map((o) => (
          <OrderCard key={o.id} order={o as any} onClick={() => onCardClick(o)} />
        ))}
        {orders.length === 0 && (
          <p className="text-[10px] text-[#2E2E2E]/20 text-center py-6">Κανένα</p>
        )}
      </div>
    </div>
  )
}

// ── Toast ──────────────────────────────────────────────────────────────────────
function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [onClose])
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-[#2E2E2E] text-white text-sm px-5 py-3 shadow-xl flex items-center gap-3">
      <span className="text-green-400">✓</span>{msg}
      <button onClick={onClose} className="ml-2 opacity-50 hover:opacity-100 text-xs">✕</button>
    </div>
  )
}

// ── Main Kanban ────────────────────────────────────────────────────────────────
export default function OrdersKanban({ initialByStatus, columns }: Props) {
  const [byStatus, setByStatus] = useState<Record<string, Order[]>>(initialByStatus)
  const [selected, setSelected] = useState<Order | null>(null)
  const [toast, setToast]       = useState<string | null>(null)
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null)

  const showToast = useCallback((msg: string) => setToast(msg), [])

  // Play sound for new orders
  const playSound = useCallback(() => {
    try {
      const ctx = new AudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = 880
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.5)
    } catch { /* audio not available */ }
  }, [])

  // Realtime: subscribe to orders INSERT + UPDATE
  useEffect(() => {
    const supabase = createClient()
    channelRef.current = supabase
      .channel('admin-orders-kanban')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        const order = payload.new as Order
        setByStatus((prev) => {
          const col = order.status in prev ? order.status : 'pending'
          return { ...prev, [col]: [order, ...(prev[col] ?? [])] }
        })
        showToast(`Νέα παραγγελία: ${order.order_number}`)
        playSound()
        // Browser notification
        if (Notification.permission === 'granted') {
          new Notification('Νέα Παραγγελία!', { body: order.order_number, icon: '/favicon.ico' })
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, (payload) => {
        const updated = payload.new as Order
        setByStatus((prev) => {
          // Remove from all columns then add to new
          const next = { ...prev }
          for (const key of Object.keys(next)) {
            next[key] = next[key].filter((o) => o.id !== updated.id)
          }
          const col = updated.status in next ? updated.status : 'pending'
          if (col !== 'cancelled') {
            next[col] = [updated, ...next[col]]
          }
          return next
        })
        // Update selected panel if open
        setSelected((prev) => prev?.id === updated.id ? { ...prev, ...updated } : prev)
      })
      .subscribe()

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    return () => { channelRef.current?.unsubscribe() }
  }, [showToast, playSound])

  const handleStatusChange = useCallback(async (orderId: string, newStatus: OrderStatus) => {
    const res = await fetch(`/api/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    if (res.ok) {
      showToast('Κατάσταση ενημερώθηκε')
    }
  }, [showToast])

  return (
    <div className="h-full flex flex-col">
      {/* Title bar */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-[#2E2E2E]" style={{ fontFamily: 'var(--font-display)' }}>
          Παραγγελίες
        </h1>
        <p className="text-xs text-[#2E2E2E]/40">Τελευταίες 7 ημέρες</p>
      </div>

      {/* Kanban board */}
      <div className="flex gap-3 overflow-x-auto pb-4">
        {columns.map((col) => (
          <KanbanColumn
            key={col.status}
            col={col}
            orders={byStatus[col.status] ?? []}
            onCardClick={setSelected}
          />
        ))}
      </div>

      {/* Side panel */}
      {selected && (
        <OrderPanel
          order={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
          onConfirm={(updatedOrder) => {
            setSelected(updatedOrder)
            showToast('Επιβεβαίωση στάλθηκε!')
          }}
        />
      )}

      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
    </div>
  )
}
