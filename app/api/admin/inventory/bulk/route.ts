import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: p } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (p?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { updates } = await request.json() as { updates: { id: string; stock_grams: number }[] }
  const admin = createAdminClient()

  const results = await Promise.allSettled(
    updates.map(({ id, stock_grams }) =>
      admin.from('products').update({ stock_grams }).eq('id', id)
    )
  )

  const failed = results.filter((r) => r.status === 'rejected').length
  return NextResponse.json({ updated: updates.length - failed, failed })
}
