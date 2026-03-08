import { createClient } from '@/lib/supabase/server'
import type { CatalogFilters, Product, Category, Recipe } from '@/types'

const PAGE_SIZE = 12

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order')
  return data ?? []
}

export async function getProducts(filters: CatalogFilters = {}): Promise<{
  products: Product[]
  total: number
}> {
  const supabase = await createClient()
  const page = filters.page ?? 1
  const from = (page - 1) * PAGE_SIZE
  const to   = from + PAGE_SIZE - 1

  let query = supabase
    .from('products')
    .select('*, category:categories(*), cuts(*)', { count: 'exact' })
    .eq('is_active', true)

  if (filters.category) {
    query = query.eq('categories.slug', filters.category)
    // join filter via categories
    query = query.not('category_id', 'is', null)
  }
  if (filters.minPrice !== undefined) {
    query = query.gte('price_per_kg', filters.minPrice)
  }
  if (filters.maxPrice !== undefined) {
    query = query.lte('price_per_kg', filters.maxPrice)
  }
  if (filters.origin) {
    query = query.ilike('origin', `%${filters.origin}%`)
  }

  switch (filters.sort) {
    case 'price_asc':  query = query.order('price_per_kg', { ascending: true });  break
    case 'price_desc': query = query.order('price_per_kg', { ascending: false }); break
    case 'newest':     query = query.order('created_at',   { ascending: false }); break
    default:           query = query.order('featured', { ascending: false }).order('name'); break
  }

  query = query.range(from, to)

  const { data, count } = await query
  return { products: (data as Product[]) ?? [], total: count ?? 0 }
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*, category:categories!inner(*), cuts(*)')
    .eq('is_active', true)
    .eq('categories.slug', categorySlug)
    .order('name')
  return (data as Product[]) ?? []
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*, category:categories(*), cuts(*)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  return (data as Product) ?? null
}

export async function getRecipesForProduct(productId: string): Promise<Recipe[]> {
  const supabase = await createClient()
  // recipes where product_ids array contains this product's id
  const { data } = await supabase
    .from('recipes')
    .select('*')
    .contains('product_ids', [productId])
    .limit(3)
  return (data as Recipe[]) ?? []
}

export async function getFeaturedProducts(limit = 6): Promise<Product[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*, category:categories(*), cuts(*)')
    .eq('is_active', true)
    .eq('featured', true)
    .order('name')
    .limit(limit)
  return (data as Product[]) ?? []
}

export async function getDistinctOrigins(): Promise<string[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('origin')
    .eq('is_active', true)
    .not('origin', 'is', null)
  const origins = [...new Set((data ?? []).map((r: { origin: string }) => r.origin).filter(Boolean))]
  return origins.sort()
}
