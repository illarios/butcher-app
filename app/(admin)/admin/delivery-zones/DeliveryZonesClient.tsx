'use client'

import { useState, useTransition } from 'react'
import type { DeliveryZone } from '@/types'

interface Props { initialZones: DeliveryZone[] }

const POSTAL_RE = /^\d{5}$/

// ── Inline toggle ──────────────────────────────────────────────────────────────
async function toggleZone(id: string, isActive: boolean) {
  await fetch('/api/admin/delivery-zones', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, is_active: isActive }),
  })
}

async function deleteZone(id: string) {
  await fetch(`/api/admin/delivery-zones/${id}`, { method: 'DELETE' })
}

async function upsertZone(zone: Partial<DeliveryZone> & { id?: string }) {
  return fetch('/api/admin/delivery-zones', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(zone),
  })
}

// ── Tag input ──────────────────────────────────────────────────────────────────
function TagInput({ tags, onChange }: { tags: string[]; onChange: (t: string[]) => void }) {
  const [input, setInput] = useState('')
  const [error, setError] = useState('')

  const add = () => {
    const v = input.trim()
    if (!POSTAL_RE.test(v)) { setError('5 ψηφία απαιτούνται'); return }
    if (tags.includes(v)) { setError('Υπάρχει ήδη'); return }
    onChange([...tags, v])
    setInput('')
    setError('')
  }

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 bg-[#C8102E]/10 text-[#C8102E] text-xs px-2 py-0.5">
            {t}
            <button type="button" onClick={() => onChange(tags.filter((x) => x !== t))} className="hover:text-[#8B0000]">✕</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder="Πληκτρολογήστε Τ.Κ. + Enter"
          maxLength={5}
          className="flex-1 border border-[#EDE0D0] px-3 py-2 text-sm focus:outline-none focus:border-[#C8102E]"
        />
        <button type="button" onClick={add} className="bg-[#2E2E2E] text-white text-xs px-3 py-2 hover:bg-black">
          +
        </button>
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

// ── Zone Form ──────────────────────────────────────────────────────────────────
interface ZoneFormProps {
  initial?: DeliveryZone
  onSave: () => void
  onCancel: () => void
}

function ZoneForm({ initial, onSave, onCancel }: ZoneFormProps) {
  const [name, setName]       = useState(initial?.name ?? '')
  const [postal, setPostal]   = useState<string[]>(initial?.postal_codes ?? [])
  const [fee, setFee]         = useState(String(initial?.delivery_fee ?? 3))
  const [mins, setMins]       = useState(String(initial?.estimated_delivery_minutes ?? 60))
  const [minOrder, setMinOrder] = useState(String(initial?.min_order_amount ?? 0))
  const [active, setActive]   = useState(initial?.is_active ?? true)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError('Απαιτείται όνομα ζώνης'); return }
    if (postal.length === 0) { setError('Προσθέστε τουλάχιστον έναν Τ.Κ.'); return }
    setSaving(true)
    const res = await upsertZone({
      id:                          initial?.id,
      name:                        name.trim(),
      postal_codes:                postal,
      delivery_fee:                parseFloat(fee),
      estimated_delivery_minutes:  parseInt(mins),
      min_order_amount:            parseFloat(minOrder),
      is_active:                   active,
    })
    if (!res.ok) { setError('Αποτυχία αποθήκευσης'); setSaving(false); return }
    onSave()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-[#EDE0D0] p-6 space-y-4">
      <h3 className="text-sm font-bold text-[#2E2E2E] uppercase tracking-widest">
        {initial ? 'Επεξεργασία ζώνης' : 'Νέα ζώνη'}
      </h3>

      <div>
        <label className="block text-xs uppercase tracking-widest text-[#2E2E2E]/50 mb-1.5">Όνομα</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-[#EDE0D0] px-3 py-2 text-sm focus:outline-none focus:border-[#C8102E]" />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-[#2E2E2E]/50 mb-1.5">Ταχυδρομικοί κώδικες</label>
        <TagInput tags={postal} onChange={setPostal} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Χρέωση (€)', value: fee, set: setFee },
          { label: 'Εκτ. λεπτά', value: mins, set: setMins },
          { label: 'Ελάχ. παραγγελία (€)', value: minOrder, set: setMinOrder },
        ].map((f) => (
          <div key={f.label}>
            <label className="block text-xs uppercase tracking-widest text-[#2E2E2E]/50 mb-1.5">{f.label}</label>
            <input type="number" value={f.value} onChange={(e) => f.set(e.target.value)} className="w-full border border-[#EDE0D0] px-3 py-2 text-sm focus:outline-none focus:border-[#C8102E]" />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setActive(!active)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${active ? 'bg-green-500' : 'bg-gray-300'}`}
        >
          <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${active ? 'translate-x-4' : 'translate-x-1'}`} />
        </button>
        <span className="text-sm text-[#2E2E2E]/60">{active ? 'Ενεργή' : 'Ανενεργή'}</span>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-3 justify-end">
        <button type="button" onClick={onCancel} className="text-xs uppercase tracking-widest text-[#2E2E2E]/50 hover:text-[#2E2E2E] px-4 py-2">
          Ακύρωση
        </button>
        <button type="submit" disabled={saving} className="bg-[#C8102E] text-white text-xs uppercase tracking-widest px-5 py-2 hover:bg-[#8B0000] disabled:opacity-50">
          {saving ? 'Αποθήκευση...' : 'Αποθήκευση'}
        </button>
      </div>
    </form>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function DeliveryZonesClient({ initialZones }: Props) {
  const [zones, setZones]     = useState(initialZones)
  const [editId, setEditId]   = useState<string | null>(null)
  const [adding, setAdding]   = useState(false)
  const [, startTransition]   = useTransition()

  const reload = () => {
    fetch('/api/admin/delivery-zones')
      .then((r) => r.json())
      .then((data) => setZones(data.zones ?? []))
  }

  const handleToggle = (id: string, current: boolean) => {
    startTransition(async () => {
      setZones((prev) => prev.map((z) => z.id === id ? { ...z, is_active: !current } : z))
      await toggleZone(id, !current)
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm('Διαγραφή ζώνης;')) return
    startTransition(async () => {
      await deleteZone(id)
      setZones((prev) => prev.filter((z) => z.id !== id))
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-[#2E2E2E]" style={{ fontFamily: 'var(--font-display)' }}>
          Ζώνες Delivery
        </h1>
        <button
          onClick={() => { setAdding(true); setEditId(null) }}
          className="bg-[#C8102E] text-white text-xs uppercase tracking-widest px-4 py-2 hover:bg-[#8B0000]"
        >
          + Νέα ζώνη
        </button>
      </div>

      {adding && (
        <div className="mb-6">
          <ZoneForm onSave={() => { setAdding(false); reload() }} onCancel={() => setAdding(false)} />
        </div>
      )}

      <div className="space-y-3">
        {zones.map((zone) => (
          <div key={zone.id}>
            {editId === zone.id ? (
              <ZoneForm
                initial={zone}
                onSave={() => { setEditId(null); reload() }}
                onCancel={() => setEditId(null)}
              />
            ) : (
              <div className="bg-white border border-[#EDE0D0] p-5 flex items-start gap-4">
                {/* Toggle */}
                <button
                  onClick={() => handleToggle(zone.id, zone.is_active)}
                  className={`relative inline-flex h-5 w-9 shrink-0 mt-0.5 items-center rounded-full transition-colors ${zone.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${zone.is_active ? 'translate-x-4' : 'translate-x-1'}`} />
                </button>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#2E2E2E]">{zone.name}</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {zone.postal_codes.map((pc) => (
                      <span key={pc} className="text-[10px] bg-[#F5EFE6] text-[#2E2E2E]/60 px-1.5 py-0.5">{pc}</span>
                    ))}
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-[#2E2E2E]/50">
                    <span>Χρέωση: <strong>{Number(zone.delivery_fee).toFixed(2)}€</strong></span>
                    <span>Εκτ.: <strong>{zone.estimated_delivery_minutes}&apos;</strong></span>
                    <span>Ελάχ.: <strong>{Number(zone.min_order_amount).toFixed(2)}€</strong></span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button onClick={() => { setEditId(zone.id); setAdding(false) }} className="text-xs text-[#2E2E2E]/40 hover:text-[#C8102E] px-2 py-1">
                    Επεξεργασία
                  </button>
                  <button onClick={() => handleDelete(zone.id)} className="text-xs text-[#2E2E2E]/40 hover:text-red-600 px-2 py-1">
                    Διαγραφή
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
