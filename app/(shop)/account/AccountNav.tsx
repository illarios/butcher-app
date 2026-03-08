'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/account/orders',  label: 'Παραγγελίες', icon: '📦' },
  { href: '/account/loyalty', label: 'Loyalty',     icon: '✦'  },
  { href: '/account/profile', label: 'Προφίλ',      icon: '👤' },
]

export default function AccountNav() {
  const pathname = usePathname()

  return (
    <nav className="py-2">
      {NAV.map((item) => {
        const active = pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
              active
                ? 'text-[#C8102E] bg-[#F5EFE6] font-medium border-l-2 border-[#C8102E]'
                : 'text-[#2E2E2E]/70 hover:text-[#C8102E] hover:bg-[#F5EFE6] border-l-2 border-transparent'
            }`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
