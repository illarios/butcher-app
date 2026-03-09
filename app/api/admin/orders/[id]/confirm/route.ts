import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { orderConfirmedEmail } from '@/lib/email/templates'
import { createNotification } from '@/lib/notifications'
import { sendPushToUser } from '@/lib/push'

interface Params { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params

  // Verify caller is admin
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: callerProfile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (callerProfile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { estimated_ready_at, admin_note } = body

  if (!estimated_ready_at) {
    return NextResponse.json({ error: 'estimated_ready_at required' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Update order
  const { data: order, error } = await admin
    .from('orders')
    .update({
      estimated_ready_at,
      admin_note: admin_note ?? null,
      status: 'confirmed',
      confirmed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*, profiles:profile_id(full_name, email:id)')
    .single()

  if (error || !order) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }

  // Fetch customer email from auth.users via admin client
  const { data: authUser } = await admin.auth.admin.getUserById(order.profile_id)
  const customerEmail = authUser?.user?.email
  const customerName  = (order as any).profiles?.full_name

  // Format ready time for notification body
  const readyDate = new Date(estimated_ready_at)
  const timeStr   = readyDate.toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' })
  const now       = new Date()
  const isToday   = readyDate.toDateString() === now.toDateString()
  const readyLabel = isToday ? `Σήμερα στις ${timeStr}` : readyDate.toLocaleDateString('el-GR', { weekday: 'long', day: 'numeric', month: 'long' }) + ` στις ${timeStr}`

  // Create in-app notification (non-blocking)
  createNotification({
    profileId: order.profile_id,
    type: 'order_confirmed',
    title: `Παραγγελία ${order.order_number} επιβεβαιώθηκε`,
    body: readyLabel,
    link: `/account/orders/${order.id}`,
  }).catch(() => {})

  // Send push notification (non-blocking)
  sendPushToUser(order.profile_id, {
    title: `Παραγγελία ${order.order_number} επιβεβαιώθηκε!`,
    body: `Έτοιμη ${readyLabel}`,
    data: { url: `/account/orders/${order.id}` },
  }).catch(() => {})

  // Send confirmation email (non-blocking)
  if (customerEmail && process.env.RESEND_API_KEY) {
    const { Resend } = await import('resend')
    new Resend(process.env.RESEND_API_KEY).emails.send({
      from: 'Κρεοπωλείο Μάρκος <noreply@kreopoleiomakros.gr>',
      to: customerEmail,
      subject: `Παραγγελία ${order.order_number} — Έτοιμη ${readyLabel}`,
      html: orderConfirmedEmail(order, customerName, estimated_ready_at, admin_note),
    }).catch(() => { /* non-blocking */ })
  }

  return NextResponse.json({ order })
}
