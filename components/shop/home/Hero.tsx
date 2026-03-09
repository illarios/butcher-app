import Link from 'next/link'

export default function Hero() {
  return (
    <section className="bg-[#F5EFE6] border-b border-[#EDE0D0]">
      <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16 py-16 sm:py-20 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-8">
        {/* Left: text */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-[#C8102E] mb-4">
            Από το 1993 — Αθήνα
          </p>
          <h1
            className="text-3xl sm:text-4xl font-bold text-[#0D0D0D] leading-snug"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Η τέχνη του καλού κρέατος.
          </h1>
          <p className="mt-3 text-sm text-[#2E2E2E]/60 max-w-sm leading-relaxed">
            Επιλεγμένες κοπές από Έλληνες κτηνοτρόφους.<br />
            Φρέσκο κάθε μέρα, παραδοτέο σε εσάς.
          </p>
        </div>

        {/* Right: CTAs */}
        <div className="flex items-center gap-4 shrink-0">
          <Link
            href="/products"
            className="bg-[#C8102E] text-white text-[11px] uppercase tracking-widest px-6 py-3 hover:bg-[#8B0000] transition-colors"
          >
            Παραγγείλτε τώρα
          </Link>
          <Link
            href="#brand-story"
            className="text-[11px] uppercase tracking-widest text-[#2E2E2E]/50 hover:text-[#C8102E] transition-colors"
          >
            Η ιστορία μας →
          </Link>
        </div>
      </div>
    </section>
  )
}
