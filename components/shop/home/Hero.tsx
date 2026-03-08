import Link from 'next/link'

export default function Hero() {
  return (
    <section
      className="relative flex items-center bg-[#0D0D0D] overflow-hidden"
      style={{ minHeight: '85vh' }}
    >
      {/* Background image placeholder — replace src with actual image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
        aria-hidden="true"
      />

      {/* Grain overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
        }}
      />

      {/* Red accent line left */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#C8102E]" aria-hidden="true" />

      <div className="relative z-10 max-w-7xl mx-auto px-8 sm:px-12 lg:px-16 py-24">
        {/* Eyebrow */}
        <p className="text-xs uppercase tracking-[0.3em] text-[#C8102E] mb-6">
          Από το 1993 — Αθήνα
        </p>

        {/* Headline */}
        <h1
          className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[#F5EFE6] leading-tight max-w-2xl mb-6"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Η τέχνη<br />
          του καλού<br />
          κρέατος.
        </h1>

        {/* Subheadline */}
        <p className="text-base sm:text-lg text-[#F5EFE6]/70 max-w-md mb-10 leading-relaxed">
          Επιλεγμένες κοπές από Έλληνες κτηνοτρόφους. Φρέσκο κάθε μέρα,
          παραδοτέο σε εσάς.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap gap-4">
          <Link
            href="/shop"
            className="inline-block bg-[#C8102E] text-white text-sm uppercase tracking-widest px-8 py-4 hover:bg-[#8B0000] transition-colors"
          >
            Παραγγείλτε τώρα
          </Link>
          <Link
            href="#brand-story"
            className="inline-block border border-[#F5EFE6]/40 text-[#F5EFE6] text-sm uppercase tracking-widest px-8 py-4 hover:border-[#F5EFE6] transition-colors"
          >
            Η ιστορία μας
          </Link>
        </div>
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#F5EFE6] to-transparent"
        aria-hidden="true"
      />
    </section>
  )
}
