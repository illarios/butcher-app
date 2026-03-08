import { createClient } from '@/lib/supabase/server'
import type { Order, OrderStatus } from '@/types'
import OrdersKanban from './OrdersKanban'

export const dynamic = 'force-dynamic'

const KANBAN_COLUMNS: { status: OrderStatus; label: string; color: string }[] = [
  { status: 'pending',          label: 'Νέες',           color: 'border-amber-400'  },
  { status: 'confirmed',        label: 'Επιβεβαιωμένες', color: 'border-blue-400'   },
  { status: 'preparing',        label: 'Ετοιμάζονται',   color: 'border-purple-400' },
  { status: 'ready',            label: 'Έτοιμες',        color: 'border-green-400'  },
  { status: 'out_for_delivery', label: 'Εστάλησαν',      color: 'border-indigo-400' },
  { status: 'delivered',        label: 'Παραδόθηκαν',    color: 'border-gray-400'   },
]

export { KANBAN_COLUMNS }

export default async function AdminOrdersPage() {
  const supabase = await createClient()

  // Fetch all non-cancelled orders from today + last 7 days
  const since = new Date()
  since.setDate(since.getDate() - 7)

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      profiles:profile_id ( full_name, phone ),
      delivery_zones:delivery_zone_id ( name )
    `)
    .neq('status', 'cancelled')
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false })

  // Group by status
  const byStatus: Record<string, Order[]> = {}
  for (const col of KANBAN_COLUMNS) {
    byStatus[col.status] = []
  }
  for (const order of (orders ?? [])) {
    if (byStatus[order.status]) {
      byStatus[order.status].push(order as Order)
    }
  }

  return <OrdersKanban initialByStatus={byStatus} columns={KANBAN_COLUMNS} />
}
