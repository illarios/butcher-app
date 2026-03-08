import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kreopoleiomakros.gr'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  const [{ data: products }, { data: recipes }] = await Promise.all([
    supabase.from('products').select('slug, updated_at').eq('is_active', true),
    supabase.from('recipes').select('slug, updated_at').eq('is_published', true),
  ])

  const productUrls: MetadataRoute.Sitemap = (products ?? []).map((p) => ({
    url: `${BASE_URL}/products/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const recipeUrls: MetadataRoute.Sitemap = (recipes ?? []).map((r) => ({
    url: `${BASE_URL}/recipes/${r.slug}`,
    lastModified: r.updated_at ? new Date(r.updated_at) : new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  return [
    { url: BASE_URL,                      lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE_URL}/products`,        lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE_URL}/recipes`,         lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.7 },
    ...productUrls,
    ...recipeUrls,
  ]
}
