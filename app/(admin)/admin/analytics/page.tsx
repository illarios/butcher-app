import { createClient } from '@/lib/supabase/server'
import AnalyticsClient from './AnalyticsClient'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  const supabase = await createClient()

  // Last 30 days
  const since = new Date()
  since.setDate(since.getDate() - 30)
  const sinceIso = since.toISOString()

  const [
    { data: orders },
    { count: totalCustomers },
    { data: ordersAllTime },
  ] = await Promise.all([
    supabase
      .from('orders')
      .select('id, total, subtotal, created_at, status, fulfillment_type, items, delivery_zone_id')
      .neq('status', 'cancelled')
      .gte('created_at', sinceIso)
      .order('created_at', { ascending: true }),
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .neq('role', 'admin')
      .gte('created_at', sinceIso),
    supabase
      .from('orders')
      .select('total, created_at, fulfillment_type, delivery_zone_id')
      .neq('status', 'cancelled'),
  ])

  // KPIs
  const completedOrders = (orders ?? []).filter((o) => o.status !== 'pending')
  const revenue         = completedOrders.reduce((s, o) => s + Number(o.total), 0)
  const orderCount      = completedOrders.length
  const aov             = orderCount > 0 ? revenue / orderCount : 0

  // Revenue by day (last 30 days)
  const revenueByDay: Record<string, number> = {}
  for (const o of completedOrders) {
    const day = o.created_at.slice(0, 10)
    revenueByDay[day] = (revenueByDay[day] ?? 0) + Number(o.total)
  }

  // Category breakdown from items
  const categoryRevenue: Record<string, number> = {}
  for (const o of (orders ?? [])) {
    for (const item of (o.items as Array<{ product_name: string; line_total: number }>)) {
      const cat = item.product_name.split(' ')[0] // rough split
      categoryRevenue[cat] = (categoryRevenue[cat] ?? 0) + Number(item.line_total)
    }
  }

  // Top products
  const productRevenue: Record<string, number> = {}
  for (const o of (orders ?? [])) {
    for (const item of (o.items as Array<{ product_name: string; line_total: number }>)) {
      productRevenue[item.product_name] = (productRevenue[item.product_name] ?? 0) + Number(item.line_total)
    }
  }
  const topProducts = Object.entries(productRevenue)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, total]) => ({ name, total }))

  // Fulfillment split
  const fulfillmentSplit = {
    pickup:   (ordersAllTime ?? []).filter((o) => o.fulfillment_type === 'pickup').length,
    delivery: (ordersAllTime ?? []).filter((o) => o.fulfillment_type === 'delivery').length,
  }

  // Orders per zone
  const zoneOrders: Record<string, number> = {}
  for (const o of (ordersAllTime ?? []).filter((o) => o.fulfillment_type === 'delivery' && o.delivery_zone_id)) {
    zoneOrders[o.delivery_zone_id!] = (zoneOrders[o.delivery_zone_id!] ?? 0) + 1
  }

  // Fetch zone names
  const zoneIds = Object.keys(zoneOrders)
  let zoneNames: Record<string, string> = {}
  if (zoneIds.length > 0) {
    const { data: zones } = await supabase
      .from('delivery_zones').select('id, name').in('id', zoneIds)
    for (const z of (zones ?? [])) zoneNames[z.id] = z.name
  }

  const zoneHeatmap = Object.entries(zoneOrders)
    .map(([id, count]) => ({ name: zoneNames[id] ?? id, count }))
    .sort((a, b) => b.count - a.count)

  return (
    <AnalyticsClient
      kpis={{ revenue, orderCount, aov, newCustomers: totalCustomers ?? 0 }}
      revenueByDay={revenueByDay}
      topProducts={topProducts}
      fulfillmentSplit={fulfillmentSplit}
      zoneHeatmap={zoneHeatmap}
      rawOrders={(ordersAllTime ?? []).map((o) => ({
        created_at: o.created_at,
        total: Number(o.total),
        fulfillment_type: o.fulfillment_type,
      }))}
    />
  )
}
