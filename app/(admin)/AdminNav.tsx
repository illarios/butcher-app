'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Props { pendingCount: number }

const NAV = [
  { href: '/admin/orders',         label: 'Παραγγελίες',  icon: '📦' },
  { href: '/admin/delivery-zones', label: 'Ζώνες',        icon: '🗺️' },
  { href: '/admin/products',       label: 'Προϊόντα',     icon: '🥩' },
  { href: '/admin/inventory',      label: 'Αποθέματα',    icon: '📊' },
  { href: '/admin/customers',      label: 'Πελάτες',      icon: '👥' },
  { href: '/admin/analytics',      label: 'Αναλυτικά',    icon: '📈' },
]

export default function AdminNav({ pendingCount }: Props) {
  const pathname = usePathname()

  return (
    <nav className="flex-1 py-3">
      {NAV.map((item) => {
        const active = pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
              active
                ? 'bg-white/10 text-white border-l-2 border-[#C8102E]'
                : 'text-white/50 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
            }`}
          >
            <span className="text-base">{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            {item.href === '/admin/orders' && pendingCount > 0 && (
              <span className="bg-amber-400 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
