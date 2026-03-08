'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

const SORT_OPTIONS = [
  { value: 'featured',   label: 'Προτεινόμενα' },
  { value: 'price_asc',  label: 'Τιμή ↑' },
  { value: 'price_desc', label: 'Τιμή ↓' },
  { value: 'newest',     label: 'Νέα' },
] as const

interface Props {
  total: number
}

export default function SortBar({ total }: Props) {
  const router   = useRouter()
  const pathname = usePathname()
  const params   = useSearchParams()
  const current  = params.get('sort') ?? 'featured'

  const handleSort = (value: string) => {
    const next = new URLSearchParams(params.toString())
    next.set('sort', value)
    next.delete('page')
    router.push(`${pathname}?${next.toString()}`)
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
      <p className="text-sm text-[#2E2E2E]/60">
        <span className="font-semibold text-[#2E2E2E]">{total}</span> προϊόντα
      </p>

      <div className="flex items-center gap-1 flex-wrap">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleSort(opt.value)}
            className={`px-3 py-1.5 text-xs uppercase tracking-widest border transition-colors ${
              current === opt.value
                ? 'bg-[#C8102E] text-white border-[#C8102E]'
                : 'border-[#EDE0D0] text-[#2E2E2E] hover:border-[#C8102E] hover:text-[#C8102E]'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
