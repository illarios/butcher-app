import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getOrderById, getOrderStatusLog } from '@/lib/queries/account'
import type { OrderStatus, FulfillmentType } from '@/types'
import OrderDetailClient from './OrderDetailClient'

interface PageProps {
  params: Promise<{ id: string }>
}

// ── Status config ──────────────────────────────────────────────────────────────
export const STATUS_CONFIG: Record<OrderStatus, { label: string; description: string; icon: string }> = {
  pending:          { label: 'Ελήφθη',         description: 'Η παραγγελία σας ελήφθη',            icon: '📋' },
  confirmed:        { label: 'Επιβεβαιώθηκε',  description: 'Ο Μάρκος επιβεβαίωσε την παραγγελία', icon: '✓'  },
  preparing:        { label: 'Ετοιμάζεται',    description: 'Το κρέας σας ετοιμάζεται',            icon: '🔪' },
  ready:            { label: 'Έτοιμη',          description: 'Η παραγγελία σας είναι έτοιμη',       icon: '✦'  },
  out_for_delivery: { label: 'Σε διανομή',      description: 'Ο διανομέας είναι καθ\' οδόν',        icon: '🚚' },
  delivered:        { label: 'Παραδόθηκε',      description: 'Η παραγγελία σας παραδόθηκε',         icon: '🎉' },
  cancelled:        { label: 'Ακυρώθηκε',       description: 'Η παραγγελία ακυρώθηκε',              icon: '✕'  },
}

const STATUS_ORDER: OrderStatus[] = [
  'pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered',
]

export function formatPrice(n: number) {
  return n.toFixed(2).replace('.', ',') + '€'
}

export function formatWeight(g: number) {
  return g >= 1000 ? `${(g / 1000).toFixed(2).replace('.', ',')} kg` : `${g} g`
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params
  const [order, statusLog] = await Promise.all([
    getOrderById(id),
    getOrderStatusLog(id),
  ])

  if (!order) notFound()

  const isCancelled = order.status === 'cancelled'
  const currentIdx  = isCancelled ? -1 : STATUS_ORDER.indexOf(order.status)

  return (
    <div>
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link
            href="/account/orders"
            className="text-xs uppercase tracking-widest text-[#2E2E2E]/40 hover:text-[#C8102E] transition-colors"
          >
            ← Παραγγελίες
          </Link>
          <h1
            className="text-2xl font-bold text-[#2E2E2E] mt-2"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {order.order_number}
          </h1>
          <p className="text-xs text-[#2E2E2E]/50 mt-1">
            {new Date(order.created_at).toLocaleDateString('el-GR', {
              weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
            })}
          </p>
        </div>
        {/* Fulfillment + payment badges */}
        <div className="flex flex-col items-end gap-2">
          <FulfillmentBadge type={order.fulfillment_type} />
          <span className="text-[10px] uppercase tracking-wider text-[#2E2E2E]/50 border border-[#EDE0D0] px-2 py-0.5">
            💵 Πληρωμή κατά παραλαβή
          </span>
        </div>
      </div>

      <div className="space-y-4">

        {/* ── Realtime client island (estimated ready + toast + reorder) ── */}
        <OrderDetailClient order={order} statusLog={statusLog} />

        {/* ── Status Timeline (server-rendered, initial state) ── */}
        {!isCancelled ? (
          <div className="bg-white border border-[#EDE0D0] p-6">
            <h2 className="text-sm font-bold text-[#2E2E2E] uppercase tracking-widest mb-5">
              Κατάσταση παραγγελίας
            </h2>
            <div className="space-y-0">
              {STATUS_ORDER.map((st, idx) => {
                const cfg       = STATUS_CONFIG[st]
                const isDone    = idx <= currentIdx
                const isCurrent = idx === currentIdx
                const isLast    = idx === STATUS_ORDER.length - 1

                return (
                  <div key={st} className="flex gap-4">
                    {/* Timeline spine */}
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 border-2 ${
                        isCurrent
                          ? 'bg-[#C8102E] border-[#C8102E] text-white'
                          : isDone
                            ? 'bg-[#2E2E2E] border-[#2E2E2E] text-white'
                            : 'bg-white border-[#EDE0D0] text-[#2E2E2E]/30'
                      }`}>
                        {isDone ? (isCurrent ? cfg.icon : '✓') : <span className="text-xs">{idx + 1}</span>}
                      </div>
                      {!isLast && (
                        <div className={`w-0.5 h-8 ${idx < currentIdx ? 'bg-[#2E2E2E]' : 'bg-[#EDE0D0]'}`} />
                      )}
                    </div>
                    {/* Label */}
                    <div className="pb-4 pt-1">
                      <p className={`text-sm font-semibold ${isCurrent ? 'text-[#C8102E]' : isDone ? 'text-[#2E2E2E]' : 'text-[#2E2E2E]/30'}`}>
                        {cfg.label}
                        {isCurrent && <span className="ml-2 text-[10px] bg-[#C8102E]/10 text-[#C8102E] px-1.5 py-0.5">Τώρα</span>}
                      </p>
                      <p className={`text-xs mt-0.5 ${isCurrent ? 'text-[#2E2E2E]/60' : isDone ? 'text-[#2E2E2E]/40' : 'text-[#2E2E2E]/20'}`}>
                        {cfg.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 p-6 flex items-start gap-3">
            <span className="text-2xl">✕</span>
            <div>
              <p className="font-semibold text-red-800 text-sm">Η παραγγελία ακυρώθηκε</p>
              {order.admin_note && (
                <p className="text-xs text-red-700 mt-1">{order.admin_note}</p>
              )}
            </div>
          </div>
        )}

        {/* ── Order items ─────────────────────────────────────── */}
        <div className="bg-white border border-[#EDE0D0]">
          <div className="p-5 border-b border-[#EDE0D0]">
            <h2 className="text-sm font-bold text-[#2E2E2E] uppercase tracking-widest">
              Προϊόντα
            </h2>
          </div>
          <ul className="divide-y divide-[#EDE0D0]">
            {order.items.map((item, i) => (
              <li key={i} className="flex items-start gap-4 p-5">
                {/* Image placeholder */}
                <div className="w-14 h-14 bg-[#EDE0D0] shrink-0 flex items-center justify-center text-2xl">
                  🥩
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#2E2E2E] text-sm">{item.product_name}</p>
                  {item.cut_name && (
                    <p className="text-xs text-[#2E2E2E]/50 mt-0.5">Κόψιμο: {item.cut_name}</p>
                  )}
                  <p className="text-xs text-[#2E2E2E]/50 mt-0.5">{formatWeight(item.weight_grams)}</p>
                  {item.notes && (
                    <p className="text-xs italic text-[#2E2E2E]/40 mt-0.5">"{item.notes}"</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-[#2E2E2E]">{formatPrice(item.line_total)}</p>
                  <p className="text-[10px] text-[#2E2E2E]/40 mt-0.5">
                    {formatPrice(item.price_per_kg + item.extra_price_per_kg)}/kg
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Delivery address ────────────────────────────────── */}
        <div className="bg-white border border-[#EDE0D0] p-5">
          <h2 className="text-sm font-bold text-[#2E2E2E] uppercase tracking-widest mb-3">
            {order.fulfillment_type === 'pickup' ? 'Παραλαβή' : 'Διεύθυνση διανομής'}
          </h2>
          {order.fulfillment_type === 'pickup' ? (
            <div className="flex items-center gap-3 text-sm text-[#2E2E2E]/70">
              <span className="text-xl">🏪</span>
              <div>
                <p className="font-medium text-[#2E2E2E]">Παραλαβή από κατάστημα</p>
                <p className="text-xs text-[#2E2E2E]/50 mt-0.5">Κρεοπωλείο Μάρκος</p>
              </div>
            </div>
          ) : order.delivery_address ? (
            <address className="not-italic text-sm text-[#2E2E2E]/70 leading-relaxed">
              {order.delivery_address.street} {order.delivery_address.number}
              {order.delivery_address.floor && `, Όροφος ${order.delivery_address.floor}`}
              <br />
              {order.delivery_address.city}, {order.delivery_address.postal_code}
              {order.delivery_address.notes && (
                <><br /><span className="italic text-xs">"{order.delivery_address.notes}"</span></>
              )}
            </address>
          ) : null}
        </div>

        {/* ── Order summary ────────────────────────────────────── */}
        <div className="bg-white border border-[#EDE0D0] p-5">
          <h2 className="text-sm font-bold text-[#2E2E2E] uppercase tracking-widest mb-4">
            Σύνοψη
          </h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-[#2E2E2E]/60">Υποσύνολο</dt>
              <dd className="font-medium">{formatPrice(order.subtotal)}</dd>
            </div>
            {order.delivery_fee > 0 && (
              <div className="flex justify-between">
                <dt className="text-[#2E2E2E]/60">Μεταφορικά</dt>
                <dd className="font-medium">{formatPrice(order.delivery_fee)}</dd>
              </div>
            )}
            {order.loyalty_discount > 0 && (
              <div className="flex justify-between text-green-700">
                <dt>Έκπτωση loyalty</dt>
                <dd className="font-medium">−{formatPrice(order.loyalty_discount)}</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-[#EDE0D0] pt-2 font-bold text-base">
              <dt>Σύνολο</dt>
              <dd className="text-[#C8102E]">{formatPrice(order.total)}</dd>
            </div>
          </dl>

          {order.loyalty_points_earned > 0 && (
            <div className="mt-4 flex items-center gap-2 text-xs text-[#C8102E] bg-[#C8102E]/5 border border-[#C8102E]/20 px-3 py-2">
              <span>✦</span>
              <span>Κερδίσατε <strong>{order.loyalty_points_earned} πόντους</strong> από αυτή την παραγγελία</span>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

// ── Fulfillment badge ──────────────────────────────────────────────────────────
function FulfillmentBadge({ type }: { type: FulfillmentType }) {
  const config: Record<FulfillmentType, { label: string; icon: string }> = {
    pickup:   { label: 'Παραλαβή', icon: '🏪' },
    delivery: { label: 'Διανομή',  icon: '🚚' },
  }
  const c = config[type]
  return (
    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-[#2E2E2E]/50 border border-[#EDE0D0] px-2 py-0.5">
      {c.icon} {c.label}
    </span>
  )
}
