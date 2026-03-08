import { createClient } from '@/lib/supabase/server'
import InventoryClient from './InventoryClient'

export const dynamic = 'force-dynamic'

export default async function InventoryPage() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('id, name, stock_grams, is_active, categories:category_id(name)')
    .order('name')

  return <InventoryClient initialProducts={products ?? []} />
}
