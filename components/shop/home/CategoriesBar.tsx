import Image from 'next/image'
import Link from 'next/link'

const CATEGORIES = [
  { slug: 'mosxari',         label: 'Μοσχάρι',        image: '/images/products/HNG_ribeye.jpg' },
  { slug: 'arni-katsiki',   label: 'Αρνί & Κατσίκι', image: '/images/products/KoreanShortRib.webp' },
  { slug: 'xoirino',        label: 'Χοιρινό',         image: '/images/products/PorkSpareRibs.jpg' },
  { slug: 'poulerika',      label: 'Πουλερικά',       image: '/images/products/Chicken_thighs_bonein.jpg' },
  { slug: 'paraskeyasmata', label: 'Παρασκευάσματα',  image: '/images/products/Chorizo.jpg' },
]

export default function CategoriesBar() {
  return (
    <section className="bg-[#F5EFE6] py-12 border-b border-[#EDE0D0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs uppercase tracking-[0.3em] text-[#2E2E2E]/50 mb-8">
          Κατηγορίες
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/products?category=${cat.slug}`}
              className="group flex flex-col items-center gap-3 bg-white border border-[#EDE0D0] hover:border-[#C8102E] transition-colors overflow-hidden"
            >
              {/* Image */}
              <div className="w-full aspect-square relative overflow-hidden">
                <Image
                  src={cat.image}
                  alt={cat.label}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <span
                className="text-xs uppercase tracking-widest text-[#2E2E2E] group-hover:text-[#C8102E] transition-colors text-center pb-4 px-2"
              >
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
