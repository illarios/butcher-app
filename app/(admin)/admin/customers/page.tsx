import { createClient } from '@/lib/supabase/server'
import CustomersClient from './CustomersClient'

export const dynamic = 'force-dynamic'

export default async function CustomersPage() {
  const supabase = await createClient()

  // Get all profiles with order aggregates
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, phone, loyalty_points, loyalty_tier, created_at, role')
    .neq('role', 'admin')
    .order('created_at', { ascending: false })

  // Get order counts + totals per customer
  const { data: orderAggs } = await supabase
    .from('orders')
    .select('profile_id, total, status')
    .neq('status', 'cancelled')

  // Aggregate per profile
  const aggMap: Record<string, { count: number; total: number }> = {}
  for (const o of (orderAggs ?? [])) {
    if (!aggMap[o.profile_id]) aggMap[o.profile_id] = { count: 0, total: 0 }
    aggMap[o.profile_id].count++
    aggMap[o.profile_id].total += Number(o.total)
  }

  const customers = (profiles ?? []).map((p) => ({
    ...p,
    order_count: aggMap[p.id]?.count ?? 0,
    total_spent: aggMap[p.id]?.total ?? 0,
  }))

  return <CustomersClient initialCustomers={customers} />
}
