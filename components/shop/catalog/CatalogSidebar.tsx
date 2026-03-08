'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import type { Category } from '@/types'

interface Props {
  categories: Category[]
  origins: string[]
}

const PRICE_MAX = 30

export default function CatalogSidebar({ categories, origins }: Props) {
  const router   = useRouter()
  const pathname = usePathname()
  const params   = useSearchParams()

  const push = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString())
      if (value === null || value === '') {
        next.delete(key)
      } else {
        next.set(key, value)
      }
      next.delete('page')
      router.push(`${pathname}?${next.toString()}`)
    },
    [params, pathname, router]
  )

  const activeCategory = params.get('category') ?? ''
  const activeOrigin   = params.get('origin') ?? ''
  const minPrice       = Number(params.get('minPrice') ?? 0)
  const maxPrice       = Number(params.get('maxPrice') ?? PRICE_MAX)

  return (
    <aside className="w-full lg:w-56 shrink-0">
      {/* Reset */}
      {params.toString() && (
        <button
          onClick={() => router.push(pathname)}
          className="text-xs uppercase tracking-widest text-[#C8102E] hover:underline mb-6 block"
        >
          ✕ Καθαρισμός φίλτρων
        </button>
      )}

      {/* Category */}
      <div className="mb-8">
        <h3 className="text-[10px] uppercase tracking-[0.25em] text-[#2E2E2E]/50 mb-3">
          Κατηγορία
        </h3>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => push('category', null)}
              className={`text-sm w-full text-left py-1 transition-colors ${
                !activeCategory
                  ? 'text-[#C8102E] font-semibold'
                  : 'text-[#2E2E2E] hover:text-[#C8102E]'
              }`}
            >
              Όλα
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => push('category', cat.slug)}
                className={`text-sm w-full text-left py-1 transition-colors ${
                  activeCategory === cat.slug
                    ? 'text-[#C8102E] font-semibold'
                    : 'text-[#2E2E2E] hover:text-[#C8102E]'
                }`}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Price range */}
      <div className="mb-8">
        <h3 className="text-[10px] uppercase tracking-[0.25em] text-[#2E2E2E]/50 mb-3">
          Τιμή / κιλό
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between text-xs text-[#2E2E2E]/60">
            <span>{minPrice.toFixed(0)}€</span>
            <span>{maxPrice >= PRICE_MAX ? `${PRICE_MAX}€+` : `${maxPrice.toFixed(0)}€`}</span>
          </div>
          <input
            type="range"
            min={0}
            max={PRICE_MAX}
            step={1}
            value={maxPrice}
            onChange={(e) => push('maxPrice', e.target.value)}
            className="w-full accent-[#C8102E]"
          />
        </div>
      </div>

      {/* Origin */}
      {origins.length > 0 && (
        <div className="mb-8">
          <h3 className="text-[10px] uppercase tracking-[0.25em] text-[#2E2E2E]/50 mb-3">
            Προέλευση
          </h3>
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => push('origin', null)}
                className={`text-sm w-full text-left py-1 transition-colors ${
                  !activeOrigin ? 'text-[#C8102E] font-semibold' : 'text-[#2E2E2E] hover:text-[#C8102E]'
                }`}
              >
                Όλες
              </button>
            </li>
            {origins.map((origin) => (
              <li key={origin}>
                <button
                  onClick={() => push('origin', origin)}
                  className={`text-sm w-full text-left py-1 transition-colors ${
                    activeOrigin === origin
                      ? 'text-[#C8102E] font-semibold'
                      : 'text-[#2E2E2E] hover:text-[#C8102E]'
                  }`}
                >
                  {origin}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  )
}
