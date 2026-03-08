'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { X, Trash2, ShoppingBag } from 'lucide-react'
import { useCartStore, itemTotal } from '@/lib/stores/cart'

interface Props {
  open: boolean
  onClose: () => void
}

function formatWeight(grams: number): string {
  if (grams >= 1000) return `${(grams / 1000).toFixed(grams % 1000 === 0 ? 0 : 1)} κιλά`
  return `${grams} γρ`
}

function formatEur(eur: number): string {
  return eur.toFixed(2).replace('.', ',') + '€'
}

export default function CartDrawer({ open, onClose }: Props) {
  const { items, removeItem, subtotal, loyaltyPointsEstimate } = useCartStore()
  const drawerRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Trap focus inside drawer when open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const sub = subtotal()
  const pts = loyaltyPointsEstimate()

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 z-50 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Καλάθι αγορών"
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-2xl transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDE0D0]">
          <h2
            className="text-lg font-bold text-[#2E2E2E]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Καλάθι
            {items.length > 0 && (
              <span className="ml-2 text-sm font-normal text-[#2E2E2E]/50">
                ({items.length} {items.length === 1 ? 'προϊόν' : 'προϊόντα'})
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            aria-label="Κλείσιμο καλαθιού"
            className="text-[#2E2E2E]/50 hover:text-[#C8102E] transition-colors"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
              <ShoppingBag size={48} strokeWidth={1} className="text-[#EDE0D0]" />
              <p className="text-sm text-[#2E2E2E]/50">Το καλάθι σας είναι άδειο.</p>
              <button
                onClick={onClose}
                className="text-xs uppercase tracking-widest text-[#C8102E] hover:underline"
              >
                Συνεχίστε τις αγορές →
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-[#EDE0D0]">
              {items.map((item) => (
                <li key={item.key} className="flex gap-4 px-6 py-4">
                  {/* Thumbnail */}
                  <div className="w-16 h-16 bg-[#EDE0D0] shrink-0 overflow-hidden">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl opacity-30">🥩</div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-semibold text-[#2E2E2E] truncate"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {item.productName}
                    </p>
                    {item.cutName && (
                      <p className="text-xs text-[#2E2E2E]/50">{item.cutName}</p>
                    )}
                    <p className="text-xs text-[#2E2E2E]/50">{formatWeight(item.weightGrams)}</p>
                    {item.notes && (
                      <p className="text-xs text-[#2E2E2E]/40 italic mt-0.5 truncate">
                        "{item.notes}"
                      </p>
                    )}
                  </div>

                  {/* Price + remove */}
                  <div className="flex flex-col items-end justify-between shrink-0">
                    <span className="text-sm font-bold text-[#2E2E2E]">
                      {formatEur(itemTotal(item))}
                    </span>
                    <button
                      onClick={() => removeItem(item.key)}
                      aria-label={`Αφαίρεση ${item.productName}`}
                      className="text-[#2E2E2E]/30 hover:text-[#C8102E] transition-colors"
                    >
                      <Trash2 size={14} strokeWidth={1.5} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-[#EDE0D0] px-6 py-5 space-y-4 bg-white">
            {/* Loyalty estimate */}
            <div className="flex items-center gap-2 text-xs text-[#2E2E2E]/60 bg-[#F5EFE6] px-3 py-2">
              <span>✦</span>
              <span>
                Θα κερδίσετε περίπου{' '}
                <strong className="text-[#C8102E]">{pts} πόντους</strong> επιβράβευσης.
              </span>
            </div>

            {/* Subtotal */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#2E2E2E]/60 uppercase tracking-widest text-xs">
                Υποσύνολο
              </span>
              <span
                className="text-xl font-bold text-[#2E2E2E]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {formatEur(sub)}
              </span>
            </div>

            <p className="text-[10px] text-[#2E2E2E]/40">
              Τα έξοδα παράδοσης υπολογίζονται στο checkout.
            </p>

            {/* CTA */}
            <Link
              href="/checkout"
              onClick={onClose}
              className="block w-full bg-[#C8102E] text-white text-sm uppercase tracking-widest py-4 text-center hover:bg-[#8B0000] transition-colors"
            >
              Προχώρησε στην Παραγγελία →
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
