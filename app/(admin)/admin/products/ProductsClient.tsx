'use client'

import { useState } from 'react'

interface Category { id: string; name: string; slug: string }

interface ProductRow {
  id: string
  name: string
  slug: string
  price_per_kg: number
  is_active: boolean
  featured: boolean
  stock_grams: number | null
  product_type: 'cut' | 'preparation'
  images: string[]
  description?: string
  origin?: string
  breed?: string
  aging_days?: number
  min_weight_grams: number
  max_weight_grams: number
  step_grams: number
  category_id: string
  categories?: Category | null
}

interface Props {
  initialProducts: ProductRow[]
  categories: Category[]
}

// ── Field component ────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-widest text-[#2E2E2E]/50 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function Input({ name, defaultValue, type = 'text', required, placeholder, step }: {
  name: string; defaultValue?: string | number; type?: string
  required?: boolean; placeholder?: string; step?: string
}) {
  return (
    <input
      name={name}
      type={type}
      defaultValue={defaultValue ?? ''}
      required={required}
      placeholder={placeholder}
      step={step}
      className="w-full border border-[#EDE0D0] px-3 py-2 text-sm focus:outline-none focus:border-[#C8102E] bg-white"
    />
  )
}

// ── Product form ───────────────────────────────────────────────────────────────
function ProductForm({
  initial, categories, onSave, onCancel,
}: {
  initial?: ProductRow; categories: Category[]; onSave: () => void; onCancel: () => void
}) {
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')
  const [featured, setFeatured] = useState(initial?.featured ?? false)
  const [active, setActive]   = useState(initial?.is_active ?? true)
  const [images, setImages]   = useState<string[]>(initial?.images ?? [])
  const [imgInput, setImgInput] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd  = new FormData(e.currentTarget)
    const obj: Record<string, unknown> = {}
    fd.forEach((v, k) => { obj[k] = v })

    obj.featured         = featured
    obj.is_active        = active
    obj.images           = images
    obj.price_per_kg     = parseFloat(obj.price_per_kg as string)
    obj.min_weight_grams = parseInt(obj.min_weight_grams as string)
    obj.max_weight_grams = parseInt(obj.max_weight_grams as string)
    obj.step_grams       = parseInt(obj.step_grams as string)
    if (obj.aging_days)  obj.aging_days = parseInt(obj.aging_days as string)

    setSaving(true)
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(initial?.id ? { ...obj, id: initial.id } : obj),
    })
    if (!res.ok) { setError('Αποτυχία αποθήκευσης'); setSaving(false); return }
    onSave()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-[#EDE0D0] p-6 space-y-4">
      <h3 className="text-sm font-bold text-[#2E2E2E] uppercase tracking-widest">
        {initial ? 'Επεξεργασία προϊόντος' : 'Νέο προϊόν'}
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Όνομα">
          <Input name="name" defaultValue={initial?.name} required />
        </Field>
        <Field label="Slug">
          <Input name="slug" defaultValue={initial?.slug} required placeholder="rib-eye-mosxari" />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Κατηγορία">
          <select
            name="category_id"
            defaultValue={initial?.category_id ?? ''}
            required
            className="w-full border border-[#EDE0D0] px-3 py-2 text-sm focus:outline-none focus:border-[#C8102E] bg-white"
          >
            <option value="">Επιλέξτε κατηγορία</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Τύπος">
          <select
            name="product_type"
            defaultValue={initial?.product_type ?? 'cut'}
            className="w-full border border-[#EDE0D0] px-3 py-2 text-sm focus:outline-none focus:border-[#C8102E] bg-white"
          >
            <option value="cut">Κρέας (cut)</option>
            <option value="preparation">Έτοιμο (preparation)</option>
          </select>
        </Field>
      </div>

      <Field label="Περιγραφή">
        <textarea
          name="description"
          defaultValue={initial?.description ?? ''}
          rows={2}
          className="w-full border border-[#EDE0D0] px-3 py-2 text-sm focus:outline-none focus:border-[#C8102E] bg-white resize-none"
        />
      </Field>

      <div className="grid grid-cols-3 gap-4">
        <Field label="Τιμή/κιλό (€)">
          <Input name="price_per_kg" type="number" step="0.01" defaultValue={initial?.price_per_kg} required />
        </Field>
        <Field label="Ελάχ. βάρος (g)">
          <Input name="min_weight_grams" type="number" defaultValue={initial?.min_weight_grams ?? 200} required />
        </Field>
        <Field label="Μέγ. βάρος (g)">
          <Input name="max_weight_grams" type="number" defaultValue={initial?.max_weight_grams ?? 5000} required />
        </Field>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Field label="Βήμα (g)">
          <Input name="step_grams" type="number" defaultValue={initial?.step_grams ?? 100} required />
        </Field>
        <Field label="Προέλευση">
          <Input name="origin" defaultValue={initial?.origin} />
        </Field>
        <Field label="Ωρίμανση (μέρες)">
          <Input name="aging_days" type="number" defaultValue={initial?.aging_days} />
        </Field>
      </div>

      {/* Images */}
      <div>
        <label className="block text-[10px] uppercase tracking-widest text-[#2E2E2E]/50 mb-1.5">URLs εικόνων</label>
        <div className="flex gap-2 mb-2">
          <input
            type="url"
            value={imgInput}
            onChange={(e) => setImgInput(e.target.value)}
            placeholder="https://..."
            className="flex-1 border border-[#EDE0D0] px-3 py-2 text-sm focus:outline-none focus:border-[#C8102E]"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                if (imgInput.trim()) { setImages([...images, imgInput.trim()]); setImgInput('') }
              }
            }}
          />
          <button
            type="button"
            onClick={() => { if (imgInput.trim()) { setImages([...images, imgInput.trim()]); setImgInput('') } }}
            className="bg-[#2E2E2E] text-white text-xs px-3 py-2"
          >+</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {images.map((url, i) => (
            <div key={i} className="flex items-center gap-1 bg-[#F5EFE6] text-xs px-2 py-1">
              <span className="truncate max-w-[120px]">{url.split('/').pop()}</span>
              <button type="button" onClick={() => setImages(images.filter((_, j) => j !== i))} className="text-red-500">✕</button>
            </div>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="flex items-center gap-6">
        {[
          { label: 'Ενεργό', value: active, set: setActive },
          { label: 'Featured', value: featured, set: setFeatured },
        ].map((t) => (
          <div key={t.label} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => t.set(!t.value)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${t.value ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${t.value ? 'translate-x-4' : 'translate-x-1'}`} />
            </button>
            <span className="text-sm text-[#2E2E2E]/60">{t.label}</span>
          </div>
        ))}
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
export default function ProductsClient({ initialProducts, categories }: Props) {
  const [products, setProducts] = useState(initialProducts)
  const [editId, setEditId]     = useState<string | null>(null)
  const [adding, setAdding]     = useState(false)
  const [search, setSearch]     = useState('')

  const reload = () =>
    fetch('/api/admin/products').then((r) => r.json()).then((d) => setProducts(d.products ?? []))

  const handleDelete = async (id: string) => {
    if (!confirm('Διαγραφή προϊόντος;')) return
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  const handleToggle = async (id: string, field: 'is_active' | 'featured', current: boolean) => {
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, [field]: !current } : p))
    await fetch('/api/admin/products', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, [field]: !current }),
    })
  }

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.categories as any)?.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-[#2E2E2E]" style={{ fontFamily: 'var(--font-display)' }}>
          Προϊόντα
        </h1>
        <button
          onClick={() => { setAdding(true); setEditId(null) }}
          className="bg-[#C8102E] text-white text-xs uppercase tracking-widest px-4 py-2 hover:bg-[#8B0000]"
        >
          + Νέο προϊόν
        </button>
      </div>

      {adding && (
        <div className="mb-6">
          <ProductForm categories={categories} onSave={() => { setAdding(false); reload() }} onCancel={() => setAdding(false)} />
        </div>
      )}

      <div className="mb-4">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Αναζήτηση προϊόντος..."
          className="w-full max-w-sm border border-[#EDE0D0] px-4 py-2 text-sm focus:outline-none focus:border-[#C8102E]"
        />
      </div>

      <div className="space-y-1">
        {filtered.map((p) => (
          <div key={p.id}>
            {editId === p.id ? (
              <div className="mb-3">
                <ProductForm
                  initial={p}
                  categories={categories}
                  onSave={() => { setEditId(null); reload() }}
                  onCancel={() => setEditId(null)}
                />
              </div>
            ) : (
              <div className="bg-white border border-[#EDE0D0] px-5 py-3 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-[#2E2E2E] text-sm">{p.name}</p>
                    <span className="text-[10px] text-[#2E2E2E]/40 uppercase">{p.product_type}</span>
                  </div>
                  <p className="text-xs text-[#2E2E2E]/50">
                    {(p.categories as any)?.name ?? '—'} · {Number(p.price_per_kg).toFixed(2)}€/kg
                  </p>
                </div>

                {/* Toggles */}
                <div className="flex items-center gap-3 shrink-0">
                  {[
                    { label: 'Ενεργό', field: 'is_active' as const, value: p.is_active },
                    { label: 'Featured', field: 'featured' as const, value: p.featured },
                  ].map((t) => (
                    <div key={t.field} className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggle(p.id, t.field, t.value)}
                        className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${t.value ? 'bg-green-500' : 'bg-gray-300'}`}
                      >
                        <span className={`inline-block h-3 w-3 rounded-full bg-white transition-transform ${t.value ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
                      </button>
                      <span className="text-[10px] text-[#2E2E2E]/40">{t.label}</span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => { setEditId(p.id); setAdding(false) }} className="text-xs text-[#2E2E2E]/40 hover:text-[#C8102E] px-2 py-1">
                    Επεξεργασία
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="text-xs text-[#2E2E2E]/40 hover:text-red-600 px-2 py-1">
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
