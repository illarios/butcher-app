import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'
import { orderReceivedEmail, adminNewOrderEmail } from '@/lib/email/templates'
import type { CartStoreItem } from '@/lib/stores/cart'
import type { Address, FulfillmentType, PaymentMethod, OrderItemSnapshot } from '@/types'

const resend = new Resend(process.env.RESEND_API_KEY)

interface CheckoutPayload {
  items:            CartStoreItem[]
  fulfillmentType:  FulfillmentType
  deliveryZoneId?:  string
  deliveryAddress?: Address
  loyaltyPointsUsed?: number
  notes?:           string
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // ── Auth ────────────────────────────────────────────────────────────────────
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) {
    return NextResponse.json({ error: 'Μη εξουσιοδοτημένο' }, { status: 401 })
  }

  const body: CheckoutPayload = await request.json()
  const { items, fulfillmentType, deliveryZoneId, deliveryAddress, loyaltyPointsUsed = 0, notes } = body

  if (!items?.length) {
    return NextResponse.json({ error: 'Το καλάθι είναι άδειο' }, { status: 400 })
  }

  // ── Validate delivery zone ───────────────────────────────────────────────────
  let deliveryFee = 0
  if (fulfillmentType === 'delivery') {
    if (!deliveryZoneId || !deliveryAddress) {
      return NextResponse.json({ error: 'Απαιτείται διεύθυνση παράδοσης' }, { status: 400 })
    }
    const { data: zone } = await supabase
      .from('delivery_zones')
      .select('delivery_fee, min_order_amount, is_active')
      .eq('id', deliveryZoneId)
      .single()

    if (!zone || !zone.is_active) {
      return NextResponse.json({ error: 'Η ζώνη παράδοσης δεν είναι διαθέσιμη' }, { status: 400 })
    }
    deliveryFee = Number(zone.delivery_fee)
  }

  // ── Fetch current profile for loyalty balance ────────────────────────────────
  const { data: profile } = await supabase
    .from('profiles')
    .select('loyalty_points, full_name')
    .eq('id', user.id)
    .single()

  const availablePoints = profile?.loyalty_points ?? 0
  const pointsToUse     = Math.min(loyaltyPointsUsed, availablePoints)
  // 100 points = 1€ discount
  const loyaltyDiscount = pointsToUse / 100

  // ── Build order items snapshot ────────────────────────────────────────────────
  const orderItems: OrderItemSnapshot[] = items.map((item) => ({
    product_id:          item.productId,
    product_name:        item.productName,
    cut_name:            item.cutName,
    weight_grams:        item.weightGrams,
    price_per_kg:        item.pricePerKg,
    extra_price_per_kg:  item.extraPricePerKg,
    notes:               item.notes,
    line_total:          (item.weightGrams / 1000) * (item.pricePerKg + item.extraPricePerKg),
  }))

  const subtotal = orderItems.reduce((s, i) => s + i.line_total, 0)
  const total    = Math.max(0, subtotal + deliveryFee - loyaltyDiscount)

  // 1 point earned per €1 spent
  const pointsEarned = Math.floor(total)

  const paymentMethod: PaymentMethod = fulfillmentType === 'pickup' ? 'cop' : 'cod'

  // ── Insert order ─────────────────────────────────────────────────────────────
  const { data: order, error: insertErr } = await supabase
    .from('orders')
    .insert({
      profile_id:           user.id,
      status:               'pending',
      fulfillment_type:     fulfillmentType,
      delivery_zone_id:     deliveryZoneId ?? null,
      delivery_address:     deliveryAddress ?? null,
      payment_method:       paymentMethod,
      items:                orderItems,
      subtotal,
      delivery_fee:         deliveryFee,
      loyalty_discount:     loyaltyDiscount,
      total,
      notes:                notes ?? null,
      loyalty_points_earned: pointsEarned,
      loyalty_points_used:   pointsToUse,
    })
    .select()
    .single()

  if (insertErr || !order) {
    console.error('[checkout] insert error', insertErr)
    return NextResponse.json({ error: 'Αδυναμία δημιουργίας παραγγελίας' }, { status: 500 })
  }

  // ── Update loyalty points ─────────────────────────────────────────────────────
  const newBalance = availablePoints - pointsToUse + pointsEarned
  await supabase
    .from('profiles')
    .update({ loyalty_points: newBalance })
    .eq('id', user.id)

  if (pointsToUse > 0) {
    await supabase.from('loyalty_transactions').insert({
      profile_id:  user.id,
      order_id:    order.id,
      points:      -pointsToUse,
      type:        'redeem',
      description: `Εξαργύρωση για παραγγελία ${order.order_number}`,
    })
  }
  if (pointsEarned > 0) {
    await supabase.from('loyalty_transactions').insert({
      profile_id:  user.id,
      order_id:    order.id,
      points:      pointsEarned,
      type:        'earn',
      description: `Πόντοι από παραγγελία ${order.order_number}`,
    })
  }

  // ── Send emails (non-blocking) ────────────────────────────────────────────────
  const customerEmail = user.email!
  const customerName  = profile?.full_name ?? undefined

  Promise.allSettled([
    resend.emails.send({
      from:    'Κρεοπωλείο Μάρκος <noreply@kreopoleiomakros.gr>',
      to:      customerEmail,
      subject: `Επιβεβαίωση παραγγελίας ${order.order_number}`,
      html:    orderReceivedEmail(order, customerName),
    }),
    resend.emails.send({
      from:    'Σύστημα <noreply@kreopoleiomakros.gr>',
      to:      process.env.ADMIN_EMAIL ?? 'admin@kreopoleiomakros.gr',
      subject: `🔔 Νέα παραγγελία ${order.order_number}`,
      html:    adminNewOrderEmail(order),
    }),
  ]).catch(console.error)

  return NextResponse.json({
    orderId:     order.id,
    orderNumber: order.order_number,
    total,
    pointsEarned,
  })
}
