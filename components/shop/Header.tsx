'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ShoppingBag, User, Menu, X } from 'lucide-react'
import { useCartStore } from '@/lib/stores/cart'
import CartDrawer from '@/components/shop/CartDrawer'

const NAV_LINKS = [
  { href: '/products', label: 'Κατάστημα' },
  { href: '/products?category=mosxari', label: 'Μοσχάρι' },
  { href: '/products?category=xoirino', label: 'Χοιρινό' },
  { href: '/products?category=poulerika', label: 'Πουλερικά' },
  { href: '/products?category=paraskeyasmata', label: 'Παρασκευάσματα' },
  { href: '/recipes', label: 'Συνταγές' },
]

interface Props {
  notificationSlot?: React.ReactNode
}

export default function Header({ notificationSlot }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cartOpen, setCartOpen]     = useState(false)
  const itemCount = useCartStore((s) => s.itemCount())

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-[#EDE0D0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <span
                className="text-lg sm:text-xl font-bold tracking-widest uppercase text-[#C8102E]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                ΚΡΕΟΠΩΛΕΙΟ ΜΑΡΚΟΣ
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs uppercase tracking-widest text-[#2E2E2E] hover:text-[#C8102E] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {/* Notification bell (server-rendered slot, auth-aware) */}
              {notificationSlot}

              {/* User */}
              <Link
                href="/account"
                className="hidden sm:flex items-center justify-center w-9 h-9 text-[#2E2E2E] hover:text-[#C8102E] transition-colors"
                aria-label="Ο λογαριασμός μου"
              >
                <User size={20} strokeWidth={1.5} />
              </Link>

              {/* Cart button — opens drawer */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative flex items-center justify-center w-9 h-9 text-[#2E2E2E] hover:text-[#C8102E] transition-colors"
                aria-label="Καλάθι αγορών"
              >
                <ShoppingBag size={20} strokeWidth={1.5} />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4 h-4 bg-[#C8102E] text-white text-[10px] font-bold rounded-full">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </button>

              {/* Mobile hamburger */}
              <button
                className="lg:hidden flex items-center justify-center w-9 h-9 text-[#2E2E2E]"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Μενού"
              >
                {mobileOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-[#EDE0D0] bg-white">
            <nav className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-xs uppercase tracking-widest text-[#2E2E2E] hover:text-[#C8102E] transition-colors py-1"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/account"
                onClick={() => setMobileOpen(false)}
                className="text-xs uppercase tracking-widest text-[#2E2E2E] hover:text-[#C8102E] transition-colors py-1"
              >
                Ο λογαριασμός μου
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Cart Drawer — mounted outside header to avoid z-index stacking context issues */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
