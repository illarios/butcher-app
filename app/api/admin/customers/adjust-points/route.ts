import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: p } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (p?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { profile_id, delta, note } = await request.json()
  if (!profile_id || typeof delta !== 'number' || delta === 0) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Get current points
  const { data: profile } = await admin
    .from('profiles').select('loyalty_points').eq('id', profile_id).single()
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const newPoints = Math.max(0, (profile.loyalty_points ?? 0) + delta)

  // Update points
  await admin.from('profiles').update({ loyalty_points: newPoints }).eq('id', profile_id)

  // Log transaction
  await admin.from('loyalty_transactions').insert({
    profile_id,
    points: Math.abs(delta),
    type: delta > 0 ? 'earn' : 'redeem',
    description: note || (delta > 0 ? 'Χειροκίνητη προσαρμογή (admin)' : 'Χειροκίνητη αφαίρεση (admin)'),
  })

  return NextResponse.json({ ok: true, new_points: newPoints })
}
