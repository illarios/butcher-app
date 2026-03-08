import Link from 'next/link'

// Static featured products matching seed data prices
const FEATURED = [
  { slug: 'mosxari-kiloto',       name: 'Κιλότο',                    price: 17.90, category: 'Μοσχάρι' },
  { slug: 'mosxari-noua',         name: 'Νουά',                      price: 18.50, category: 'Μοσχάρι' },
  { slug: 'arni',                 name: 'Αρνί',                      price: 18.80, category: 'Αρνί & Κατσίκι' },
  { slug: 'xoirino-brizola',      name: 'Μπριζόλα χοιρινή',          price:  7.90, category: 'Χοιρινό' },
  { slug: 'kotopoulo-olokliro',   name: 'Κοτόπουλο ΚΙΤΡΙΝΟ',         price:  4.50, category: 'Πουλερικά' },
  { slug: 'mosxari-soutzouki',    name: 'Σουτζούκι του χασάπη',       price: 17.80, category: 'Παρασκευάσματα' },
]

function ProductCard({ product }: { product: typeof FEATURED[0] }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col bg-white border border-[#EDE0D0] hover:border-[#C8102E] transition-colors overflow-hidden"
    >
      {/* Image placeholder */}
      <div className="aspect-square bg-[#EDE0D0] relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-30">
          🥩
        </div>
        {/* Image when available */}
        {/* <Image src={product.image} alt={product.name} fill className="object-cover" /> */}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-[#C8102E]/0 group-hover:bg-[#C8102E]/5 transition-colors" />
      </div>

      <div className="p-4 flex flex-col flex-1">
        <span className="text-[10px] uppercase tracking-widest text-[#C8102E] mb-1">
          {product.category}
        </span>
        <h3
          className="text-sm font-semibold text-[#2E2E2E] leading-snug mb-auto"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {product.name}
        </h3>
        <div className="mt-3 flex items-end justify-between">
          <span className="text-base font-bold text-[#2E2E2E]">
            {product.price.toFixed(2).replace('.', ',')}€
            <span className="text-xs font-normal text-[#2E2E2E]/50 ml-1">/ κιλό</span>
          </span>
          <span className="text-xs uppercase tracking-widest text-[#C8102E] opacity-0 group-hover:opacity-100 transition-opacity">
            Επιλογή →
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function FeaturedProducts() {
  return (
    <section className="bg-[#F5EFE6] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#C8102E] mb-2">
              Επιλογή της ημέρας
            </p>
            <h2
              className="text-3xl font-bold text-[#2E2E2E]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Προτεινόμενα προϊόντα
            </h2>
          </div>
          <Link
            href="/shop"
            className="hidden sm:inline-block text-xs uppercase tracking-widest text-[#C8102E] hover:underline"
          >
            Όλα τα προϊόντα →
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 lg:gap-6">
          {FEATURED.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/shop"
            className="inline-block border border-[#C8102E] text-[#C8102E] text-xs uppercase tracking-widest px-8 py-3 hover:bg-[#C8102E] hover:text-white transition-colors"
          >
            Όλα τα προϊόντα
          </Link>
        </div>
      </div>
    </section>
  )
}
