import { Suspense } from 'react'
import { getCategories, getProducts, getDistinctOrigins } from '@/lib/queries/products'
import CatalogSidebar from '@/components/shop/catalog/CatalogSidebar'
import SortBar from '@/components/shop/catalog/SortBar'
import ProductGrid from '@/components/shop/catalog/ProductGrid'
import Pagination from '@/components/shop/catalog/Pagination'
import type { CatalogFilters } from '@/types'

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export const metadata = {
  title: 'Κατάστημα — Κρεοπωλείο Μάρκος',
}

async function CatalogContent({ filters }: { filters: CatalogFilters }) {
  const { products, total } = await getProducts(filters)

  return (
    <div className="flex-1 min-w-0">
      <SortBar total={total} />
      <ProductGrid products={products} />
      <Pagination total={total} />
    </div>
  )
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const str = (key: string) => (Array.isArray(sp[key]) ? sp[key][0] : sp[key]) ?? undefined

  const filters: CatalogFilters = {
    category: str('category'),
    origin:   str('origin'),
    minPrice: str('minPrice') ? Number(str('minPrice')) : undefined,
    maxPrice: str('maxPrice') ? Number(str('maxPrice')) : undefined,
    sort:     (str('sort') as CatalogFilters['sort']) ?? 'featured',
    page:     str('page') ? Number(str('page')) : 1,
  }

  const [categories, origins] = await Promise.all([
    getCategories(),
    getDistinctOrigins(),
  ])

  return (
    <div className="min-h-screen bg-[#F5EFE6]">
      {/* Page header */}
      <div className="bg-white border-b border-[#EDE0D0] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.3em] text-[#C8102E] mb-1">
            Φρέσκα κρέατα
          </p>
          <h1
            className="text-3xl font-bold text-[#2E2E2E]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Κατάστημα
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar */}
          <Suspense fallback={null}>
            <CatalogSidebar categories={categories} origins={origins} />
          </Suspense>

          {/* Content */}
          <Suspense
            fallback={
              <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-square bg-[#EDE0D0] animate-pulse" />
                ))}
              </div>
            }
          >
            <CatalogContent filters={filters} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
