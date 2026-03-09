'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingBag, ClipboardList, User } from 'lucide-react'

const TABS = [
  { href: '/',               label: 'Αρχική',      Icon: Home },
  { href: '/products',       label: 'Προϊόντα',    Icon: ShoppingBag },
  { href: '/account/orders', label: 'Παραγγελίες', Icon: ClipboardList },
  { href: '/account',        label: 'Λογαριασμός', Icon: User },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#EDE0D0]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Κύρια πλοήγηση"
    >
      <div className="grid grid-cols-4 h-16">
        {TABS.map(({ href, label, Icon }) => {
          // Active: exact match for '/', prefix match for others
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-1 min-h-[44px] transition-colors ${
                isActive
                  ? 'text-[#C8102E]'
                  : 'text-[#2E2E2E]/40 hover:text-[#2E2E2E]/70'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
              <span className="text-[10px] tracking-wide font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
