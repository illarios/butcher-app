'use client'

import { useState, useRef } from 'react'

interface ProductRow {
  id: string
  name: string
  stock_grams: number | null
  is_active: boolean
  categories?: { name: string } | null
}

interface Props { initialProducts: ProductRow[] }

const LOW_STOCK = 1000 // < 1kg = alert

function formatStock(g: number | null) {
  if (g === null || g === undefined) return '—'
  if (g >= 1000) return `${(g / 1000).toFixed(2)} kg`
  return `${g} g`
}

async function updateStock(id: string, stock_grams: number) {
  return fetch('/api/admin/inventory', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, stock_grams }),
  })
}

export default function InventoryClient({ initialProducts }: Props) {
  const [products, setProducts] = useState(initialProducts)
  const [editing, setEditing]   = useState<Record<string, string>>({})
  const [saving, setSaving]     = useState<Record<string, boolean>>({})
  const [csvMsg, setCsvMsg]     = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const lowStock = products.filter((p) => (p.stock_grams ?? 0) < LOW_STOCK && p.stock_grams !== null)

  const handleEdit = (id: string, val: string) => {
    setEditing((prev) => ({ ...prev, [id]: val }))
  }

  const handleSave = async (id: string) => {
    const val = parseInt(editing[id] ?? '')
    if (isNaN(val) || val < 0) return
    setSaving((prev) => ({ ...prev, [id]: true }))
    await updateStock(id, val)
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, stock_grams: val } : p))
    setEditing((prev) => { const n = { ...prev }; delete n[id]; return n })
    setSaving((prev) => { const n = { ...prev }; delete n[id]; return n })
  }

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    const lines = text.trim().split('\n').slice(1) // skip header
    const updates: { id: string; stock_grams: number }[] = []
    for (const line of lines) {
      const [id, grams] = line.split(',').map((s) => s.trim())
      const g = parseInt(grams)
      if (id && !isNaN(g)) updates.push({ id, stock_grams: g })
    }
    if (updates.length === 0) { setCsvMsg('Δεν βρέθηκαν έγκυρες εγγραφές.'); return }
    await fetch('/api/admin/inventory/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates }),
    })
    setProducts((prev) => prev.map((p) => {
      const u = updates.find((u) => u.id === p.id)
      return u ? { ...p, stock_grams: u.stock_grams } : p
    }))
    setCsvMsg(`✓ Ενημερώθηκαν ${updates.length} προϊόντα`)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-[#2E2E2E]" style={{ fontFamily: 'var(--font-display)' }}>
          Αποθέματα
        </h1>
        <div className="flex items-center gap-3">
          <label className="text-xs uppercase tracking-widest text-[#2E2E2E]/50 border border-[#EDE0D0] px-3 py-2 cursor-pointer hover:border-[#C8102E] hover:text-[#C8102E] transition-colors">
            ↑ CSV Import
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCsvUpload} />
          </label>
        </div>
      </div>

      {csvMsg && <p className="text-sm text-green-700 bg-green-50 border border-green-200 px-4 py-2 mb-4">{csvMsg}</p>}

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div className="bg-red-50 border border-red-200 px-5 py-3 mb-4 flex items-start gap-3">
          <span className="text-red-500 text-lg">⚠</span>
          <div>
            <p className="text-sm font-semibold text-red-800">Χαμηλό απόθεμα ({lowStock.length} προϊόντα)</p>
            <p className="text-xs text-red-700/70 mt-0.5">
              {lowStock.map((p) => p.name).join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* CSV template download hint */}
      <p className="text-xs text-[#2E2E2E]/40 mb-4">
        CSV format: <code>id,stock_grams</code> (πρώτη γραμμή header)
      </p>

      <div className="bg-white border border-[#EDE0D0] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#F5EFE6]">
            <tr>
              <th className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-[#2E2E2E]/50">Προϊόν</th>
              <th className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-[#2E2E2E]/50">Κατηγορία</th>
              <th className="text-center px-5 py-3 text-[10px] uppercase tracking-widest text-[#2E2E2E]/50">Απόθεμα</th>
              <th className="text-center px-5 py-3 text-[10px] uppercase tracking-widest text-[#2E2E2E]/50 w-32">Ενημέρωση (g)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EDE0D0]">
            {products.map((p) => {
              const isLow = p.stock_grams !== null && p.stock_grams < LOW_STOCK
              return (
                <tr key={p.id} className="hover:bg-[#F5EFE6]/50">
                  <td className="px-5 py-3">
                    <span className="font-medium text-[#2E2E2E]">{p.name}</span>
                    {!p.is_active && <span className="ml-2 text-[10px] text-[#2E2E2E]/30 uppercase">Ανενεργό</span>}
                  </td>
                  <td className="px-5 py-3 text-[#2E2E2E]/60">{(p.categories as any)?.name ?? '—'}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`font-semibold ${isLow ? 'text-red-600' : 'text-[#2E2E2E]'}`}>
                      {isLow && '⚠ '}{formatStock(p.stock_grams)}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        value={editing[p.id] ?? ''}
                        onChange={(e) => handleEdit(p.id, e.target.value)}
                        placeholder="γρ"
                        className="w-20 border border-[#EDE0D0] px-2 py-1 text-sm text-center focus:outline-none focus:border-[#C8102E]"
                        onKeyDown={(e) => e.key === 'Enter' && handleSave(p.id)}
                      />
                      {editing[p.id] !== undefined && (
                        <button
                          onClick={() => handleSave(p.id)}
                          disabled={saving[p.id]}
                          className="text-[10px] bg-[#C8102E] text-white px-2 py-1.5 hover:bg-[#8B0000] disabled:opacity-50"
                        >
                          {saving[p.id] ? '...' : '✓'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
