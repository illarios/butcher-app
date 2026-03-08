'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const STORAGE_KEY = 'welcomed'

export default function WelcomeModal() {
  const [show, setShow]       = useState(false)
  const [firstName, setFirstName] = useState('')

  useEffect(() => {
    // Only show once — check localStorage first
    if (localStorage.getItem(STORAGE_KEY)) return

    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      // Show modal for freshly registered users: account less than 60 seconds old
      const createdAt = new Date(user.created_at ?? 0).getTime()
      if (Date.now() - createdAt > 60_000) return

      const name = user.user_metadata?.full_name as string | undefined
      setFirstName(name?.split(' ')[0] ?? '')
      setShow(true)
    })
  }, [])

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1')
    setShow(false)
  }

  if (!show) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 px-4"
      onClick={dismiss}
    >
      <div
        className="bg-white max-w-sm w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Red header bar */}
        <div className="bg-[#C8102E] px-6 py-5">
          <h2
            className="text-white text-lg font-bold tracking-widest uppercase"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            ΚΡΕΟΠΩΛΕΙΟ ΜΑΡΚΟΣ
          </h2>
        </div>

        <div className="px-6 py-8 text-center">
          <p className="text-2xl font-bold text-[#2E2E2E] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            Καλωσορίσατε{firstName ? `, ${firstName}` : ''}!
          </p>
          <p className="text-sm text-[#2E2E2E]/60 mb-6">
            Χαιρόμαστε που είστε μαζί μας.
          </p>

          {/* Points card */}
          <div className="bg-[#0D0D0D] rounded-sm px-6 py-5 mb-6">
            <p className="text-[10px] uppercase tracking-[0.25em] text-white/40 mb-1">Δώρο καλωσορίσματος</p>
            <p className="text-4xl font-bold text-[#C8102E]" style={{ fontFamily: 'var(--font-display)' }}>
              50 πόντοι
            </p>
            <p className="text-xs text-white/60 mt-2">
              Προστέθηκαν αυτόματα στον λογαριασμό σας
            </p>
          </div>

          {/* Tier badge */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="text-[10px] uppercase tracking-wider font-semibold border border-amber-200 px-3 py-1 text-amber-700 bg-amber-50">
              ✦ Bronze
            </span>
            <span className="text-xs text-[#2E2E2E]/40">Επίπεδο εκκίνησης</span>
          </div>

          <Link
            href="/products"
            onClick={dismiss}
            className="block w-full bg-[#C8102E] text-white text-sm uppercase tracking-widest py-3 hover:bg-[#8B0000] transition-colors"
          >
            Ξεκινήστε την πρώτη σας παραγγελία
          </Link>
        </div>

        <button
          onClick={dismiss}
          className="absolute top-4 right-4 text-white/60 hover:text-white text-lg"
          style={{ position: 'absolute' }}
          aria-label="Κλείσιμο"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
