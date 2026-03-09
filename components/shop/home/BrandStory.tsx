import Image from 'next/image'

const STATS = [
  { value: '30+', label: 'Χρόνια εμπειρίας' },
  { value: '200+', label: 'Προϊόντα' },
  { value: '50+', label: 'Παραγωγοί' },
  { value: '1993', label: 'Ίδρυση' },
]

export default function BrandStory() {
  return (
    <section id="brand-story" className="bg-[#F5EFE6] py-20 border-t border-[#EDE0D0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Image side */}
          <div className="relative">
            <div className="aspect-[4/5] bg-[#EDE0D0] overflow-hidden relative">
              <Image
                src="/images/products/TomahawkRibeye.jpg"
                alt="Κρεοπωλείο Μάρκος — φρέσκο κρέας"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            {/* Red accent block */}
            <div
              className="absolute -bottom-4 -right-4 w-32 h-32 bg-[#C8102E] -z-10"
              aria-hidden="true"
            />
            {/* Stats pill */}
            <div className="absolute bottom-6 left-6 right-6 bg-white border border-[#EDE0D0] p-4 grid grid-cols-2 gap-4">
              {STATS.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p
                    className="text-2xl font-bold text-[#C8102E]"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {stat.value}
                  </p>
                  <p className="text-[10px] uppercase tracking-widest text-[#2E2E2E]/60 mt-0.5">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Text side */}
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#C8102E] mb-4">
              Η ιστορία μας
            </p>
            <h2
              className="text-4xl font-bold text-[#2E2E2E] leading-tight mb-6"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Τρεις γενιές<br />
              αγάπης για<br />
              το καλό κρέας.
            </h2>

            <div className="space-y-4 text-[#2E2E2E]/80 text-sm leading-relaxed">
              <p>
                Από το 1993, το Κρεοπωλείο Μάρκος βρίσκεται στην καρδιά της Αθήνας,
                προσφέροντας κρέας υψηλής ποιότητας από επιλεγμένους Έλληνες κτηνοτρόφους.
              </p>
              <p>
                Η φιλοσοφία μας είναι απλή: φρέσκο κρέας, σωστή κοπή, τίμια τιμή.
                Κάθε κομμάτι που βγαίνει από το χασαπείο μας φέρει την υπογραφή χρόνων
                τεχνογνωσίας και σεβασμού στο υλικό.
              </p>
              <p>
                Σήμερα, συνεχίζουμε αυτή την παράδοση και στο διαδίκτυο —
                φέρνοντας το κρεοπωλείο του γειτονιά σας, απευθείας στο σπίτι σας.
              </p>
            </div>

            {/* Decorative divider */}
            <div className="flex items-center gap-4 my-8">
              <div className="h-px flex-1 bg-[#EDE0D0]" />
              <span className="text-[#C8102E] text-xl">✦</span>
              <div className="h-px flex-1 bg-[#EDE0D0]" />
            </div>

            {/* Signature */}
            <p
              className="text-2xl text-[#2E2E2E]/60 italic"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              — Μάρκος &amp; οικογένεια
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
