'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Customer {
  id: string
  full_name?: string
  phone?: string
  loyalty_points: number
  loyalty_tier: string
  created_at: string
  order_count: number
  total_spent: number
}

interface Props { initialCustomers: Customer[] }

const TIER_COLOR: Record<string, string> = {
  bronze: 'text-amber-700 bg-amber-50 border-amber-200',
  silver: 'text-slate-600 bg-slate-50 border-slate-200',
  gold:   'text-yellow-700 bg-yellow-50 border-yellow-200',
}

function formatPrice(n: number) { return n.toFixed(2).replace('.', ',') + '€' }
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('el-GR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function CustomersClient({ initialCustomers }: Props) {
  const [customers] = useState(initialCustomers)
  const [search, setSearch]   = useState('')
  const [selected, setSelected] = useState<Customer | null>(null)
  const [adjusting, setAdjusting] = useState(false)
  const [pointsDelta, setPointsDelta] = useState('')
  const [pointsNote, setPointsNote]   = useState('')
  const [saving, setSaving]   = useState(false)
  const [msg, setMsg]         = useState('')

  const filtered = customers.filter((c) =>
    (c.full_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (c.phone ?? '').includes(search)
  )

  const handleAdjustPoints = async () => {
    if (!selected) return
    const delta = parseInt(pointsDelta)
    if (isNaN(delta) || delta === 0) return
    setSaving(true)
    const res = await fetch('/api/admin/customers/adjust-points', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile_id: selected.id, delta, note: pointsNote }),
    })
    if (res.ok) {
      setMsg(`✓ ${delta > 0 ? '+' : ''}${delta} πόντοι αποθηκεύτηκαν`)
      setAdjusting(false)
      setPointsDelta('')
      setPointsNote('')
    }
    setSaving(false)
  }

  return (
    <div className="flex gap-6 h-full">
      {/* ── Table ─────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-[#2E2E2E]" style={{ fontFamily: 'var(--font-display)' }}>
            Πελάτες
            <span className="ml-2 text-sm font-normal text-[#2E2E2E]/40">({customers.length})</span>
          </h1>
        </div>

        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Αναζήτηση με όνομα ή τηλέφωνο..."
          className="w-full max-w-sm border border-[#EDE0D0] px-4 py-2 text-sm focus:outline-none focus:border-[#C8102E] mb-4 bg-white"
        />

        <div className="bg-white border border-[#EDE0D0] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#F5EFE6]">
              <tr>
                {['Πελάτης', 'Tier', 'Παραγγελίες', 'Σύνολο', 'Πόντοι', 'Εγγραφή'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-[#2E2E2E]/50">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDE0D0]">
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => { setSelected(c); setMsg('') }}
                  className={`cursor-pointer hover:bg-[#F5EFE6]/50 transition-colors ${selected?.id === c.id ? 'bg-[#F5EFE6]' : ''}`}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#2E2E2E]">{c.full_name ?? '—'}</p>
                    {c.phone && <p className="text-xs text-[#2E2E2E]/50">{c.phone}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] uppercase tracking-wider font-semibold border px-2 py-0.5 ${TIER_COLOR[c.loyalty_tier] ?? TIER_COLOR.bronze}`}>
                      ✦ {c.loyalty_tier}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#2E2E2E]/70">{c.order_count}</td>
                  <td className="px-4 py-3 font-medium">{formatPrice(c.total_spent)}</td>
                  <td className="px-4 py-3 text-[#C8102E] font-semibold">{c.loyalty_points}</td>
                  <td className="px-4 py-3 text-[#2E2E2E]/50 text-xs">{formatDate(c.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Detail panel ──────────────────────────────────────── */}
      {selected && (
        <div className="w-72 shrink-0">
          <div className="bg-white border border-[#EDE0D0] sticky top-0">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#EDE0D0]">
              <p className="font-semibold text-[#2E2E2E] truncate">{selected.full_name ?? 'Χρήστης'}</p>
              <button onClick={() => setSelected(null)} className="text-[#2E2E2E]/30 hover:text-[#2E2E2E] text-lg">✕</button>
            </div>

            <div className="p-5 space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Παραγγελίες', value: String(selected.order_count) },
                  { label: 'Σύνολο', value: formatPrice(selected.total_spent) },
                  { label: 'Πόντοι', value: String(selected.loyalty_points) },
                  { label: 'Tier', value: selected.loyalty_tier.toUpperCase() },
                ].map((s) => (
                  <div key={s.label} className="bg-[#F5EFE6] p-3 text-center">
                    <p className="text-[10px] uppercase tracking-widest text-[#2E2E2E]/40 mb-1">{s.label}</p>
                    <p className="font-bold text-[#2E2E2E] text-sm">{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Links */}
              <div className="space-y-1">
                <Link
                  href={`/admin/orders?customer=${selected.id}`}
                  className="block text-xs text-[#C8102E] hover:underline"
                >
                  → Ιστορικό παραγγελιών
                </Link>
              </div>

              {/* Loyalty adjust */}
              <div className="border-t border-[#EDE0D0] pt-4">
                <p className="text-[10px] uppercase tracking-widest text-[#2E2E2E]/50 mb-2">Χειροκίνητη προσαρμογή πόντων</p>
                {msg && <p className="text-xs text-green-700 mb-2">{msg}</p>}
                {adjusting ? (
                  <div className="space-y-2">
                    <input
                      type="number"
                      value={pointsDelta}
                      onChange={(e) => setPointsDelta(e.target.value)}
                      placeholder="+50 ή -20"
                      className="w-full border border-[#EDE0D0] px-3 py-2 text-sm focus:outline-none focus:border-[#C8102E]"
                    />
                    <input
                      type="text"
                      value={pointsNote}
                      onChange={(e) => setPointsNote(e.target.value)}
                      placeholder="Αιτία (πχ: Αποζημίωση)"
                      className="w-full border border-[#EDE0D0] px-3 py-2 text-sm focus:outline-none focus:border-[#C8102E]"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleAdjustPoints}
                        disabled={saving}
                        className="flex-1 bg-[#C8102E] text-white text-xs py-2 hover:bg-[#8B0000] disabled:opacity-50"
                      >
                        Αποθήκευση
                      </button>
                      <button
                        onClick={() => setAdjusting(false)}
                        className="text-xs text-[#2E2E2E]/50 px-3 py-2 hover:text-[#2E2E2E]"
                      >
                        Ακύρωση
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setAdjusting(true)}
                    className="w-full border border-[#EDE0D0] text-xs text-[#2E2E2E]/60 py-2 hover:border-[#C8102E] hover:text-[#C8102E] transition-colors"
                  >
                    + Προσαρμογή πόντων
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
