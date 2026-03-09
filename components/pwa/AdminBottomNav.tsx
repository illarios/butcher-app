'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ClipboardList, MapPin, Package, BarChart3 } from 'lucide-react'

const TABS = [
  { href: '/admin/orders',         label: 'Παραγγελίες', Icon: ClipboardList },
  { href: '/admin/delivery-zones', label: 'Ζώνες',       Icon: MapPin },
  { href: '/admin/products',       label: 'Προϊόντα',    Icon: Package },
  { href: '/admin/analytics',      label: 'Αναλυτικά',  Icon: BarChart3 },
]

export default function AdminBottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-black border-t border-white/10"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Admin πλοήγηση"
    >
      <div className="grid grid-cols-4 h-16">
        {TABS.map(({ href, label, Icon }) => {
          const isActive = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-1 min-h-[44px] transition-colors ${
                isActive ? 'text-[#C8102E]' : 'text-white/30 hover:text-white/60'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
              <span className="text-[9px] tracking-wide font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
