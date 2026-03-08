import { createClient } from '@/lib/supabase/server'
import type { Order, Profile, LoyaltyTransaction } from '@/types'

// ── Profile ────────────────────────────────────────────────────────────────────
export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return data ?? null
}

export async function updateProfile(updates: {
  full_name?: string
  phone?: string
  birthday?: string
  address?: object
  notification_email?: boolean
  notification_sms?: boolean
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Δεν είστε συνδεδεμένοι.' }

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)

  if (error) return { error: 'Αποτυχία αποθήκευσης. Παρακαλώ δοκιμάστε ξανά.' }
  return { success: true }
}

// ── Orders ─────────────────────────────────────────────────────────────────────
export async function getOrders(): Promise<Order[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('orders')
    .select('*')
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false })

  return (data ?? []) as Order[]
}

export async function getOrderById(id: string): Promise<Order | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .eq('profile_id', user.id) // RLS: only own orders
    .single()

  return (data ?? null) as Order | null
}

export async function getOrderStatusLog(orderId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('order_status_log')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true })

  return data ?? []
}

// ── Loyalty ────────────────────────────────────────────────────────────────────
export async function getLoyaltyTransactions(): Promise<LoyaltyTransaction[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('loyalty_transactions')
    .select('*')
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return (data ?? []) as LoyaltyTransaction[]
}
