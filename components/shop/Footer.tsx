import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#0D0D0D] text-[#F5EFE6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

          {/* Brand */}
          <div className="md:col-span-1">
            <span
              className="block text-xl font-bold tracking-widest uppercase text-[#C8102E] mb-4"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              ΚΡΕΟΠΩΛΕΙΟ ΜΑΡΚΟΣ
            </span>
            <p className="text-sm text-[#F5EFE6]/70 leading-relaxed">
              Φρέσκο κρέας από επιλεγμένους παραγωγούς,<br />
              απευθείας στο τραπέζι σας.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-xs uppercase tracking-widest text-[#F5EFE6]/50 mb-4">
              Κατάστημα
            </h3>
            <ul className="space-y-2">
              {[
                { href: '/shop/mosxari', label: 'Μοσχάρι' },
                { href: '/shop/arni-katsiki', label: 'Αρνί & Κατσίκι' },
                { href: '/shop/xoirino', label: 'Χοιρινό' },
                { href: '/shop/poulerika', label: 'Πουλερικά' },
                { href: '/shop/paraskeyasmata', label: 'Παρασκευάσματα' },
                { href: '/recipes', label: 'Συνταγές' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#F5EFE6]/70 hover:text-[#F5EFE6] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-xs uppercase tracking-widest text-[#F5EFE6]/50 mb-4">
              Λογαριασμός
            </h3>
            <ul className="space-y-2">
              {[
                { href: '/account', label: 'Ο λογαριασμός μου' },
                { href: '/account/orders', label: 'Οι παραγγελίες μου' },
                { href: '/account/loyalty', label: 'Πόντοι επιβράβευσης' },
                { href: '/account/subscriptions', label: 'Συνδρομές' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#F5EFE6]/70 hover:text-[#F5EFE6] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Hours */}
          <div>
            <h3 className="text-xs uppercase tracking-widest text-[#F5EFE6]/50 mb-4">
              Επικοινωνία
            </h3>
            <address className="not-italic space-y-2 text-sm text-[#F5EFE6]/70">
              <p>Ιθάκης 12, Αθήνα 10431</p>
              <p>
                <a href="tel:+302101234567" className="hover:text-[#F5EFE6] transition-colors">
                  +30 210 123 4567
                </a>
              </p>
              <p>
                <a href="mailto:info@kreopoleiomakros.gr" className="hover:text-[#F5EFE6] transition-colors">
                  info@kreopoleiomakros.gr
                </a>
              </p>
            </address>

            <h3 className="text-xs uppercase tracking-widest text-[#F5EFE6]/50 mt-6 mb-3">
              Ωράριο
            </h3>
            <ul className="space-y-1 text-sm text-[#F5EFE6]/70">
              <li>Δευ–Παρ: 07:00 – 20:00</li>
              <li>Σάββατο: 07:00 – 17:00</li>
              <li>Κυριακή: Κλειστά</li>
            </ul>

            {/* Social */}
            <div className="flex gap-4 mt-6">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs uppercase tracking-widest text-[#F5EFE6]/50 hover:text-[#C8102E] transition-colors"
              >
                Instagram
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs uppercase tracking-widest text-[#F5EFE6]/50 hover:text-[#C8102E] transition-colors"
              >
                Facebook
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-6 border-t border-[#F5EFE6]/10 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-[#F5EFE6]/40">
          <p>© {new Date().getFullYear()} Κρεοπωλείο Μάρκος. Με επιφύλαξη παντός δικαιώματος.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-[#F5EFE6]/70 transition-colors">
              Πολιτική Απορρήτου
            </Link>
            <Link href="/terms" className="hover:text-[#F5EFE6]/70 transition-colors">
              Όροι Χρήσης
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
