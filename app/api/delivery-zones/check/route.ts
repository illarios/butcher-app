import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const postal = request.nextUrl.searchParams.get('postal')?.trim()

  if (!postal || !/^\d{5}$/.test(postal)) {
    return NextResponse.json({ error: 'Μη έγκυρος ΤΚ' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('delivery_zones')
    .select('id, name, delivery_fee, estimated_delivery_minutes, min_order_amount')
    .eq('is_active', true)
    .contains('postal_codes', [postal])
    .limit(1)
    .single()

  if (error || !data) {
    return NextResponse.json({ covered: false })
  }

  return NextResponse.json({
    covered: true,
    zone: {
      id:       data.id,
      name:     data.name,
      fee:      data.delivery_fee,
      minutes:  data.estimated_delivery_minutes,
      minOrder: data.min_order_amount,
    },
  })
}
