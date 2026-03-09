import Link from 'next/link'

const CATEGORIES = [
  { slug: 'mosxari',        label: 'Μοσχάρι',        emoji: '🐄', color: '#8B0000' },
  { slug: 'arni-katsiki',  label: 'Αρνί & Κατσίκι', emoji: '🐑', color: '#5C4033' },
  { slug: 'xoirino',       label: 'Χοιρινό',         emoji: '🐷', color: '#C8102E' },
  { slug: 'poulerika',     label: 'Πουλερικά',       emoji: '🐓', color: '#7B3F00' },
  { slug: 'paraskeyasmata',label: 'Παρασκευάσματα',  emoji: '🥩', color: '#2E2E2E' },
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
              className="group flex flex-col items-center gap-3 py-6 px-4 bg-white border border-[#EDE0D0] hover:border-[#C8102E] transition-colors"
            >
              <span className="text-4xl" role="img" aria-label={cat.label}>
                {cat.emoji}
              </span>
              <span
                className="text-xs uppercase tracking-widest text-[#2E2E2E] group-hover:text-[#C8102E] transition-colors text-center"
              >
                {cat.label}
              </span>
              <span
                className="block h-0.5 w-6 bg-[#EDE0D0] group-hover:bg-[#C8102E] transition-colors"
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
