import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: p } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  return p?.role === 'admin' ? user : null
}

export async function GET() {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const admin = createAdminClient()
  const { data: zones } = await admin.from('delivery_zones').select('*').order('created_at')
  return NextResponse.json({ zones: zones ?? [] })
}

export async function POST(request: Request) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const admin = createAdminClient()

  if (body.id) {
    // Update
    const { data, error } = await admin
      .from('delivery_zones').update(body).eq('id', body.id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ zone: data })
  } else {
    // Insert
    const { id: _, ...insert } = body
    const { data, error } = await admin
      .from('delivery_zones').insert(insert).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ zone: data })
  }
}

export async function PATCH(request: Request) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id, ...updates } = await request.json()
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('delivery_zones').update(updates).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ zone: data })
}
