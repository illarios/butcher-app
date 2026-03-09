import Link from 'next/link'
import Image from 'next/image'
import type { Product } from '@/types'

function ProductCard({ product }: { product: Product }) {
  const inStock = (product.stock_grams ?? 1) > 0

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col bg-white border border-[#EDE0D0] hover:border-[#C8102E] transition-colors overflow-hidden"
    >
      {/* Image */}
      <div className="aspect-square bg-[#EDE0D0] relative overflow-hidden">
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-25">
            🥩
          </div>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="text-[10px] uppercase tracking-widest text-[#2E2E2E]/60 bg-white px-3 py-1 border border-[#EDE0D0]">
              Εξαντλήθηκε
            </span>
          </div>
        )}
        {product.product_type === 'preparation' && (
          <span className="absolute top-2 left-2 bg-[#2E2E2E] text-white text-[9px] uppercase tracking-widest px-2 py-0.5">
            Παρασκεύασμα
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <span className="text-[10px] uppercase tracking-widest text-[#C8102E] mb-1">
          {product.category?.name ?? ''}
        </span>
        <h3
          className="text-sm font-semibold text-[#2E2E2E] leading-snug mb-auto"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {product.name}
        </h3>
        {product.origin && (
          <p className="text-[11px] text-[#2E2E2E]/50 mt-1">{product.origin}</p>
        )}
        <div className="mt-3 flex items-end justify-between">
          <span className="text-base font-bold text-[#2E2E2E]">
            {product.price_per_kg.toFixed(2).replace('.', ',')}€
            <span className="text-xs font-normal text-[#2E2E2E]/50 ml-1">/ κιλό</span>
          </span>
          <span className="text-xs text-[#C8102E] opacity-0 group-hover:opacity-100 transition-opacity">
            Επιλογή →
          </span>
        </div>
      </div>
    </Link>
  )
}

interface Props {
  products: Product[]
}

export default function ProductGrid({ products }: Props) {
  if (products.length === 0) {
    return (
      <div className="col-span-full py-20 text-center">
        <p className="text-[#2E2E2E]/40 text-sm">Δεν βρέθηκαν προϊόντα.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  )
}
