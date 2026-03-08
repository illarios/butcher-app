import Link from 'next/link'

const PLANS = [
  {
    id: 'weekly',
    label: 'Εβδομαδιαία',
    freq: 'Κάθε εβδομάδα',
    description: 'Φρέσκα κρέατα κάθε εβδομάδα, επιλεγμένα από εμάς για εσάς.',
    perks: ['2–3 kg επιλεγμένα κρέατα', 'Εξοικονόμηση 10%', 'Δωρεάν παράδοση'],
  },
  {
    id: 'monthly',
    label: 'Μηνιαία',
    freq: 'Κάθε μήνα',
    description: 'Η μεγάλη οικογενειακή συσκευασία — για όλον τον μήνα.',
    perks: ['6–8 kg εκλεκτά κρέατα', 'Εξοικονόμηση 15%', 'Δωρεάν παράδοση', 'Προτεραιότητα στις κοπές'],
  },
]

export default function SubscriptionTeaser() {
  return (
    <section className="bg-[#0D0D0D] py-20 relative overflow-hidden">
      {/* Grain */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-[#C8102E] mb-4">
            Συνδρομή
          </p>
          <h2
            className="text-4xl font-bold text-[#F5EFE6] mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Φρέσκο κρέας κάθε εβδομάδα.
          </h2>
          <p className="text-[#F5EFE6]/60 max-w-xl mx-auto text-sm leading-relaxed">
            Επιλέξτε το πλάνο που σας ταιριάζει και εξοικονομήστε χρόνο και χρήματα.
            Ακυρώστε όποτε θέλετε.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto mb-10">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className="border border-[#F5EFE6]/10 p-8 hover:border-[#C8102E]/50 transition-colors"
            >
              <span className="text-[10px] uppercase tracking-widest text-[#C8102E]">
                {plan.freq}
              </span>
              <h3
                className="text-xl font-bold text-[#F5EFE6] mt-2 mb-3"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {plan.label}
              </h3>
              <p className="text-sm text-[#F5EFE6]/60 mb-6 leading-relaxed">
                {plan.description}
              </p>
              <ul className="space-y-2 mb-0">
                {plan.perks.map((perk) => (
                  <li key={perk} className="flex items-center gap-2 text-sm text-[#F5EFE6]/80">
                    <span className="text-[#C8102E] text-xs">✦</span>
                    {perk}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/subscriptions"
            className="inline-block bg-[#C8102E] text-white text-sm uppercase tracking-widest px-10 py-4 hover:bg-[#8B0000] transition-colors"
          >
            Ξεκινήστε τη συνδρομή σας
          </Link>
          <p className="text-xs text-[#F5EFE6]/30 mt-4">
            Χωρίς δεσμεύσεις — ακύρωση οποτεδήποτε.
          </p>
        </div>
      </div>
    </section>
  )
}
