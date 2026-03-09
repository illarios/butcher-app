'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

// ── Update profile ─────────────────────────────────────────────────────────────
export async function updateProfileAction(_prevState: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Δεν είστε συνδεδεμένοι.' }

  const full_name = formData.get('full_name') as string
  const phone     = formData.get('phone') as string
  const birthday  = formData.get('birthday') as string | null

  const updates: Record<string, unknown> = { full_name, phone }
  if (birthday) updates.birthday = birthday

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)

  if (error) return { error: 'Αποτυχία αποθήκευσης. Παρακαλώ δοκιμάστε ξανά.' }

  revalidatePath('/account/profile')
  return { success: 'Το προφίλ σας ενημερώθηκε.' }
}

// ── Update saved address ───────────────────────────────────────────────────────
export async function updateAddressAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Δεν είστε συνδεδεμένοι.' }

  const address = {
    street:      formData.get('street') as string,
    number:      formData.get('number') as string,
    city:        formData.get('city') as string,
    postal_code: formData.get('postal_code') as string,
    floor:       formData.get('floor') as string || undefined,
    notes:       formData.get('address_notes') as string || undefined,
  }

  // Check if postal code is in a delivery zone
  const { data: zone } = await supabase
    .from('delivery_zones')
    .select('id, name')
    .contains('postal_codes', [address.postal_code])
    .eq('is_active', true)
    .single()

  const { error } = await supabase
    .from('profiles')
    .update({ address })
    .eq('id', user.id)

  if (error) return { error: 'Αποτυχία αποθήκευσης. Παρακαλώ δοκιμάστε ξανά.' }

  revalidatePath('/account/profile')
  return {
    success: 'Η διεύθυνσή σας αποθηκεύτηκε.',
    inZone: !!zone,
    zoneName: zone?.name,
  }
}

// ── Change password ────────────────────────────────────────────────────────────
export async function changePasswordAction(_prevState: unknown, formData: FormData) {
  const supabase = await createClient()

  const current  = formData.get('current_password') as string
  const newPass  = formData.get('new_password') as string
  const confirm  = formData.get('confirm_password') as string

  if (newPass !== confirm) {
    return { error: 'Οι κωδικοί δεν ταιριάζουν.' }
  }
  if (newPass.length < 8) {
    return { error: 'Ο νέος κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες.' }
  }

  // Verify current password by re-signing in
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return { error: 'Δεν είστε συνδεδεμένοι.' }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: current,
  })
  if (signInError) return { error: 'Ο τρέχων κωδικός είναι λανθασμένος.' }

  const { error } = await supabase.auth.updateUser({ password: newPass })
  if (error) return { error: 'Αποτυχία αλλαγής κωδικού. Παρακαλώ δοκιμάστε ξανά.' }

  return { success: 'Ο κωδικός σας άλλαξε με επιτυχία.' }
}

// ── Reorder ────────────────────────────────────────────────────────────────────
// Returns items snapshot from an order for the client to re-add to cart
export async function getOrderItemsForReorder(orderId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Δεν είστε συνδεδεμένοι.' }

  const { data } = await supabase
    .from('orders')
    .select('items')
    .eq('id', orderId)
    .eq('profile_id', user.id)
    .single()

  if (!data) return { error: 'Η παραγγελία δεν βρέθηκε.' }
  return { items: data.items }
}
