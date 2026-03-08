import { createClient } from '@/lib/supabase/server'
import ProductsClient from './ProductsClient'

export const dynamic = 'force-dynamic'

export default async function AdminProductsPage() {
  const supabase = await createClient()

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase
      .from('products')
      .select('*, categories:category_id(id, name, slug)')
      .order('name'),
    supabase
      .from('categories')
      .select('id, name, slug')
      .order('display_order'),
  ])

  return <ProductsClient initialProducts={products ?? []} categories={categories ?? []} />
}
