'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

const PAGE_SIZE = 12

interface Props {
  total: number
}

export default function Pagination({ total }: Props) {
  const router   = useRouter()
  const pathname = usePathname()
  const params   = useSearchParams()

  const currentPage  = Number(params.get('page') ?? 1)
  const totalPages   = Math.ceil(total / PAGE_SIZE)

  if (totalPages <= 1) return null

  const go = (page: number) => {
    const next = new URLSearchParams(params.toString())
    next.set('page', String(page))
    router.push(`${pathname}?${next.toString()}`)
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      <button
        disabled={currentPage <= 1}
        onClick={() => go(currentPage - 1)}
        className="px-4 py-2 text-xs uppercase tracking-widest border border-[#EDE0D0] text-[#2E2E2E] hover:border-[#C8102E] hover:text-[#C8102E] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        ← Προηγ.
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => go(page)}
          className={`w-9 h-9 text-sm border transition-colors ${
            page === currentPage
              ? 'bg-[#C8102E] text-white border-[#C8102E]'
              : 'border-[#EDE0D0] text-[#2E2E2E] hover:border-[#C8102E] hover:text-[#C8102E]'
          }`}
        >
          {page}
        </button>
      ))}

      <button
        disabled={currentPage >= totalPages}
        onClick={() => go(currentPage + 1)}
        className="px-4 py-2 text-xs uppercase tracking-widest border border-[#EDE0D0] text-[#2E2E2E] hover:border-[#C8102E] hover:text-[#C8102E] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        Επόμ. →
      </button>
    </div>
  )
}
