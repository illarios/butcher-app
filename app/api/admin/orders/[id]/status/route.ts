import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createNotification } from '@/lib/notifications'
import type { OrderStatus } from '@/types'

const VALID_STATUSES: OrderStatus[] = [
  'pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled',
]

interface Params { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: callerProfile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (callerProfile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { status } = await request.json()
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: order, error } = await admin
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select('id, order_number, profile_id, fulfillment_type')
    .single()

  if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 })

  // Create in-app notification for customer (non-blocking)
  const notifMap: Partial<Record<OrderStatus, { title: string; body: string }>> = {
    ready: {
      title: `Παραγγελία ${order.order_number} έτοιμη!`,
      body: order.fulfillment_type === 'pickup'
        ? 'Σας περιμένουμε στο κατάστημα.'
        : 'Ο διανομέας θα φτάσει σύντομα.',
    },
    out_for_delivery: {
      title: `Παραγγελία ${order.order_number} στο δρόμο!`,
      body: 'Ο διανομέας είναι καθ' οδόν.',
    },
    delivered: {
      title: `Παραγγελία ${order.order_number} παραδόθηκε`,
      body: 'Ευχαριστούμε! Καλή σας απόλαυση.',
    },
  }
  const notif = notifMap[status as OrderStatus]
  if (notif) {
    createNotification({
      profileId: order.profile_id,
      type: status === 'ready' || status === 'out_for_delivery' ? 'order_ready' : 'order_delivered',
      title: notif.title,
      body: notif.body,
      link: `/account/orders/${order.id}`,
    }).catch(() => {})
  }

  return NextResponse.json({ order })
}
