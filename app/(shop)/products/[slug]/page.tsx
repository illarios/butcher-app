import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProductBySlug, getRecipesForProduct } from '@/lib/queries/products'
import ImageGallery from '@/components/shop/product/ImageGallery'
import CutBuilder from '@/components/shop/product/CutBuilder'
import RelatedRecipes from '@/components/shop/product/RelatedRecipes'
import type { Metadata } from 'next'
import { LOCAL_IMAGES } from '@/lib/localImages'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return {}
  return {
    title: `${product.name} — Κρεοπωλείο Μάρκος`,
    description: product.description ?? `${product.name} — ${product.price_per_kg.toFixed(2)}€/κιλό`,
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params
  const [product, recipes] = await Promise.all([
    getProductBySlug(slug),
    getProductBySlug(slug).then((p) => p ? getRecipesForProduct(p.id) : []),
  ])

  if (!product) notFound()

  const inStock = (product.stock_grams ?? 1) > 0

  return (
    <div className="min-h-screen bg-[#F5EFE6]">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-[#EDE0D0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-xs text-[#2E2E2E]/50">
          <Link href="/" className="hover:text-[#C8102E] transition-colors">Αρχική</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-[#C8102E] transition-colors">Κατάστημα</Link>
          {product.category && (
            <>
              <span>/</span>
              <Link
                href={`/products?category=${product.category.slug}`}
                className="hover:text-[#C8102E] transition-colors"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-[#2E2E2E]">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ── Main 2-col layout ────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">

          {/* Left — Gallery */}
          <ImageGallery
            images={LOCAL_IMAGES[product.slug]
              ? [LOCAL_IMAGES[product.slug]]
              : (product.images ?? [])}
            alt={product.name}
          />

          {/* Right — Info + CutBuilder */}
          <div>
            {/* Category + stock */}
            <div className="flex items-center justify-between mb-3">
              {product.category && (
                <Link
                  href={`/products?category=${product.category.slug}`}
                  className="text-xs uppercase tracking-widest text-[#C8102E] hover:underline"
                >
                  {product.category.name}
                </Link>
              )}
              <span className={`text-xs uppercase tracking-widest ${inStock ? 'text-green-700' : 'text-[#2E2E2E]/40'}`}>
                {inStock ? '● Διαθέσιμο' : '○ Εξαντλήθηκε'}
              </span>
            </div>

            {/* Name */}
            <h1
              className="text-4xl font-bold text-[#2E2E2E] leading-tight mb-4"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {product.name}
            </h1>

            {/* Price */}
            <p className="text-2xl font-bold text-[#C8102E] mb-6">
              {product.price_per_kg.toFixed(2).replace('.', ',')}€
              <span className="text-sm font-normal text-[#2E2E2E]/60 ml-1">/ κιλό</span>
            </p>

            {/* Description */}
            {product.description && (
              <p className="text-sm text-[#2E2E2E]/70 leading-relaxed mb-6">
                {product.description}
              </p>
            )}

            {/* ── Provenance badges ──────────────────────────────────── */}
            {(product.origin || product.breed || product.aging_days) && (
              <div className="border border-[#EDE0D0] bg-white p-5 mb-8">
                <h2
                  className="text-xs uppercase tracking-[0.25em] text-[#2E2E2E]/50 mb-4"
                >
                  Προέλευση & Χαρακτηριστικά
                </h2>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
                  {product.origin && (
                    <div>
                      <dt className="text-[10px] uppercase tracking-widest text-[#2E2E2E]/40 mb-0.5">
                        Χώρα
                      </dt>
                      <dd className="text-sm font-semibold text-[#2E2E2E] flex items-center gap-1.5">
                        <span>🇬🇷</span> {product.origin}
                      </dd>
                    </div>
                  )}
                  {product.breed && (
                    <div>
                      <dt className="text-[10px] uppercase tracking-widest text-[#2E2E2E]/40 mb-0.5">
                        Φυλή
                      </dt>
                      <dd className="text-sm font-semibold text-[#2E2E2E]">{product.breed}</dd>
                    </div>
                  )}
                  {product.aging_days != null && product.aging_days > 0 && (
                    <div>
                      <dt className="text-[10px] uppercase tracking-widest text-[#2E2E2E]/40 mb-0.5">
                        Ωρίμανση
                      </dt>
                      <dd className="text-sm font-semibold text-[#2E2E2E]">
                        {product.aging_days} ημέρες
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-[10px] uppercase tracking-widest text-[#2E2E2E]/40 mb-0.5">
                      Τύπος
                    </dt>
                    <dd className="text-sm font-semibold text-[#2E2E2E]">
                      {product.product_type === 'preparation' ? 'Παρασκεύασμα' : 'Κοπή'}
                    </dd>
                  </div>
                </dl>
              </div>
            )}

            {/* ── CutBuilder ─────────────────────────────────────────── */}
            {inStock ? (
              <CutBuilder product={product} />
            ) : (
              <div className="border border-[#EDE0D0] bg-white p-6 text-center">
                <p className="text-sm text-[#2E2E2E]/60">
                  Αυτό το προϊόν δεν είναι διαθέσιμο αυτή τη στιγμή.
                </p>
                <Link
                  href="/products"
                  className="inline-block mt-4 text-xs uppercase tracking-widest text-[#C8102E] hover:underline"
                >
                  Δείτε παρόμοια προϊόντα →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ── Related Recipes ──────────────────────────────────────── */}
        <RelatedRecipes recipes={recipes} />
      </div>
    </div>
  )
}
