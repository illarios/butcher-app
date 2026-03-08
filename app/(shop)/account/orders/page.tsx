import Link from 'next/link'
import { getOrders } from '@/lib/queries/account'
import type { OrderStatus, FulfillmentType } from '@/types'

// ── Status config ──────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string }> = {
  pending:          { label: 'Εκκρεμεί',        color: 'text-amber-700  bg-amber-50  border-amber-200'  },
  confirmed:        { label: 'Επιβεβαιώθηκε',   color: 'text-blue-700   bg-blue-50   border-blue-200'   },
  preparing:        { label: 'Ετοιμάζεται',      color: 'text-purple-700 bg-purple-50 border-purple-200' },
  ready:            { label: 'Έτοιμη',           color: 'text-green-700  bg-green-50  border-green-200'  },
  out_for_delivery: { label: 'Σε διανομή',       color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
  delivered:        { label: 'Παραδόθηκε',       color: 'text-green-800  bg-green-100 border-green-300'  },
  cancelled:        { label: 'Ακυρώθηκε',        color: 'text-red-700    bg-red-50    border-red-200'    },
}

const FULFILLMENT_CONFIG: Record<FulfillmentType, { label: string; icon: string }> = {
  pickup:   { label: 'Παραλαβή',  icon: '🏪' },
  delivery: { label: 'Διανομή',   icon: '🚚' },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('el-GR', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

function formatPrice(n: number) {
  return n.toFixed(2).replace('.', ',') + '€'
}

export default async function OrdersPage() {
  const orders = await getOrders()

  return (
    <div>
      <div className="mb-6">
        <h1
          className="text-2xl font-bold text-[#2E2E2E]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Παραγγελίες μου
        </h1>
        <p className="text-sm text-[#2E2E2E]/50 mt-1">
          {orders.length > 0
            ? `${orders.length} παραγγελία${orders.length !== 1 ? 'ές' : ''} συνολικά`
            : 'Δεν έχετε κάνει παραγγελίες ακόμα.'}
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white border border-[#EDE0D0] p-12 text-center">
          <p className="text-4xl mb-4">🥩</p>
          <p className="text-[#2E2E2E]/60 mb-6">Η λίστα σας είναι άδεια προς το παρόν.</p>
          <Link
            href="/products"
            className="inline-block bg-[#C8102E] text-white text-xs uppercase tracking-widest px-6 py-3 hover:bg-[#8B0000] transition-colors"
          >
            Αγορές τώρα
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const st  = STATUS_CONFIG[order.status]
            const ft  = FULFILLMENT_CONFIG[order.fulfillment_type]
            const isPending = ['pending', 'confirmed', 'preparing'].includes(order.status)

            return (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="group block bg-white border border-[#EDE0D0] hover:border-[#C8102E] transition-colors"
              >
                <div className="flex items-center justify-between p-4 sm:p-5">
                  {/* Left: order number + date */}
                  <div className="flex items-center gap-4">
                    {/* Pulse indicator for active orders */}
                    {isPending && (
                      <span className="relative flex w-2.5 h-2.5 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                        <span className="relative inline-flex rounded-full w-2.5 h-2.5 bg-amber-400" />
                      </span>
                    )}
                    <div>
                      <p className="font-bold text-[#C8102E] text-sm" style={{ fontFamily: 'var(--font-display)' }}>
                        {order.order_number}
                      </p>
                      <p className="text-xs text-[#2E2E2E]/50 mt-0.5">{formatDate(order.created_at)}</p>
                    </div>
                  </div>

                  {/* Center: badges */}
                  <div className="hidden sm:flex items-center gap-2">
                    {/* Fulfillment */}
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-[#2E2E2E]/50 border border-[#EDE0D0] px-2 py-0.5">
                      {ft.icon} {ft.label}
                    </span>
                    {/* Status */}
                    <span className={`inline-flex items-center text-[10px] uppercase tracking-wider font-semibold border px-2 py-0.5 ${st.color}`}>
                      {st.label}
                    </span>
                  </div>

                  {/* Right: total + arrow */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#2E2E2E]">{formatPrice(order.total)}</p>
                      <p className="text-[10px] text-[#2E2E2E]/40 mt-0.5">
                        {order.items.length} τεμ.
                      </p>
                    </div>
                    <span className="text-[#2E2E2E]/30 group-hover:text-[#C8102E] transition-colors text-lg">→</span>
                  </div>
                </div>

                {/* Mobile: status row */}
                <div className="sm:hidden flex items-center gap-2 px-4 pb-3">
                  <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-[#2E2E2E]/50 border border-[#EDE0D0] px-2 py-0.5">
                    {ft.icon} {ft.label}
                  </span>
                  <span className={`inline-flex items-center text-[10px] uppercase tracking-wider font-semibold border px-2 py-0.5 ${st.color}`}>
                    {st.label}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
