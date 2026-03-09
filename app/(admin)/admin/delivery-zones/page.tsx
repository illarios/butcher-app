import { createClient } from '@/lib/supabase/server'
import DeliveryZonesClient from './DeliveryZonesClient'

export const dynamic = 'force-dynamic'

export default async function DeliveryZonesPage() {
  const supabase = await createClient()
  const { data: zones } = await supabase
    .from('delivery_zones')
    .select('*')
    .order('created_at', { ascending: true })

  return <DeliveryZonesClient initialZones={zones ?? []} />
}
