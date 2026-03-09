'use client'

import { useState, useMemo } from 'react'
import type { Product, Cut } from '@/types'
import { useCartStore } from '@/lib/stores/cart'
import { LOCAL_IMAGES } from '@/lib/localImages'

interface Props {
  product: Product
}

function formatWeight(grams: number): string {
  if (grams >= 1000) {
    return `${(grams / 1000).toFixed(grams % 1000 === 0 ? 0 : 1)} κιλά`
  }
  return `${grams} γρ`
}

function formatPrice(eur: number): string {
  return eur.toFixed(2).replace('.', ',') + '€'
}

export default function CutBuilder({ product }: Props) {
  const cuts     = product.cuts ?? []
  const hasCuts  = cuts.length > 0

  const [selectedCut, setSelectedCut] = useState<Cut | null>(hasCuts ? cuts[0] : null)
  const [weight, setWeight]           = useState(product.min_weight_grams)
  const [notes, setNotes]             = useState('')
  const [added, setAdded]             = useState(false)
  const addItem = useCartStore((s) => s.addItem)

  const pricePerKg = product.price_per_kg + (selectedCut?.extra_price_per_kg ?? 0)
  const lineTotal  = useMemo(
    () => (weight / 1000) * pricePerKg,
    [weight, pricePerKg]
  )

  const addToCart = () => {
    addItem({
      productId:         product.id,
      productName:       product.name,
      categoryName:      product.category?.name,
      cutId:             selectedCut?.id,
      cutName:           selectedCut?.name,
      weightGrams:       weight,
      pricePerKg:        product.price_per_kg,
      extraPricePerKg:   selectedCut?.extra_price_per_kg ?? 0,
      notes:             notes.trim() || undefined,
      image:             LOCAL_IMAGES[product.slug] ?? product.images?.[0],
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2500)
  }

  const step     = product.step_grams
  const minW     = product.min_weight_grams
  const maxW     = product.max_weight_grams
  const steps    = useMemo(() => {
    const arr: number[] = []
    for (let w = minW; w <= maxW; w += step) arr.push(w)
    return arr
  }, [minW, maxW, step])

  return (
    <div className="space-y-8">

      {/* ── Step 1: Cut type ─────────────────────────────────────── */}
      {hasCuts && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-6 h-6 flex items-center justify-center bg-[#C8102E] text-white text-xs font-bold">1</span>
            <h3 className="text-xs uppercase tracking-widest text-[#2E2E2E] font-semibold">
              Επιλογή κοπής
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Standard cut */}
            <label className={`flex items-start gap-3 p-4 border cursor-pointer transition-colors ${
              selectedCut === null
                ? 'border-[#C8102E] bg-[#C8102E]/5'
                : 'border-[#EDE0D0] hover:border-[#C8102E]/50'
            }`}>
              <input
                type="radio"
                name="cut"
                checked={selectedCut === null}
                onChange={() => setSelectedCut(null)}
                className="mt-0.5 accent-[#C8102E]"
              />
              <div>
                <p className="text-sm font-semibold text-[#2E2E2E]">Κανονική κοπή</p>
                <p className="text-xs text-[#2E2E2E]/50 mt-0.5">Χωρίς επιπλέον κόστος</p>
              </div>
            </label>

            {cuts.map((cut) => (
              <label
                key={cut.id}
                className={`flex items-start gap-3 p-4 border cursor-pointer transition-colors ${
                  selectedCut?.id === cut.id
                    ? 'border-[#C8102E] bg-[#C8102E]/5'
                    : 'border-[#EDE0D0] hover:border-[#C8102E]/50'
                }`}
              >
                <input
                  type="radio"
                  name="cut"
                  checked={selectedCut?.id === cut.id}
                  onChange={() => setSelectedCut(cut)}
                  className="mt-0.5 accent-[#C8102E]"
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#2E2E2E]">{cut.name}</p>
                  {cut.description && (
                    <p className="text-xs text-[#2E2E2E]/50 mt-0.5">{cut.description}</p>
                  )}
                  {cut.extra_price_per_kg > 0 && (
                    <p className="text-xs text-[#C8102E] mt-1">
                      +{cut.extra_price_per_kg.toFixed(2).replace('.', ',')}€ / κιλό
                    </p>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* ── Step 2: Weight slider ─────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className="w-6 h-6 flex items-center justify-center bg-[#C8102E] text-white text-xs font-bold">
            {hasCuts ? '2' : '1'}
          </span>
          <h3 className="text-xs uppercase tracking-widest text-[#2E2E2E] font-semibold">
            Ποσότητα
          </h3>
        </div>

        <div className="space-y-4">
          {/* Live display */}
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-[#2E2E2E]" style={{ fontFamily: 'var(--font-display)' }}>
              {formatWeight(weight)}
            </span>
            <span className="text-xl font-bold text-[#C8102E]">
              {formatPrice(lineTotal)}
            </span>
          </div>

          {/* Slider */}
          <input
            type="range"
            min={minW}
            max={maxW}
            step={step}
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            className="w-full accent-[#C8102E] h-2"
          />

          {/* Min / max labels */}
          <div className="flex justify-between text-[10px] uppercase tracking-widest text-[#2E2E2E]/40">
            <span>{formatWeight(minW)}</span>
            <span>{formatWeight(maxW)}</span>
          </div>

          {/* Quick-select buttons */}
          <div className="flex flex-wrap gap-2">
            {steps
              .filter((w) => [500, 1000, 1500, 2000, 3000].includes(w))
              .map((w) => (
                <button
                  key={w}
                  onClick={() => setWeight(w)}
                  className={`px-3 py-1.5 text-xs border transition-colors ${
                    weight === w
                      ? 'bg-[#C8102E] text-white border-[#C8102E]'
                      : 'border-[#EDE0D0] text-[#2E2E2E] hover:border-[#C8102E] hover:text-[#C8102E]'
                  }`}
                >
                  {formatWeight(w)}
                </button>
              ))}
          </div>

          {/* Price breakdown */}
          <p className="text-xs text-[#2E2E2E]/50">
            {formatWeight(weight)} × {pricePerKg.toFixed(2).replace('.', ',')}€/kg
            {selectedCut && selectedCut.extra_price_per_kg > 0 && (
              <span className="text-[#C8102E]">
                {' '}(+{selectedCut.extra_price_per_kg.toFixed(2).replace('.', ',')}€/kg για {selectedCut.name})
              </span>
            )}
          </p>
        </div>
      </div>

      {/* ── Step 3: Notes ─────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className="w-6 h-6 flex items-center justify-center bg-[#C8102E] text-white text-xs font-bold">
            {hasCuts ? '3' : '2'}
          </span>
          <h3 className="text-xs uppercase tracking-widest text-[#2E2E2E] font-semibold">
            Οδηγίες για τον Μάρκο
          </h3>
        </div>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          maxLength={300}
          placeholder="πχ. &quot;Κόψτε σε κύβους 3cm&quot; ή &quot;Αφαιρέστε λίπος&quot;…"
          className="w-full bg-transparent border border-[#EDE0D0] focus:border-[#C8102E] outline-none p-3 text-sm text-[#2E2E2E] placeholder:text-[#2E2E2E]/30 resize-none transition-colors"
        />
        <p className="text-[10px] text-[#2E2E2E]/40 text-right mt-1">
          {notes.length}/300
        </p>
      </div>

      {/* ── Step 4: Summary + Add to cart ─────────────────────────── */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className="w-6 h-6 flex items-center justify-center bg-[#C8102E] text-white text-xs font-bold">
            {hasCuts ? '4' : '3'}
          </span>
          <h3 className="text-xs uppercase tracking-widest text-[#2E2E2E] font-semibold">
            Σύνοψη
          </h3>
        </div>

        {/* Summary card */}
        <div className="bg-[#F5EFE6] border border-[#EDE0D0] p-4 mb-4 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-[#2E2E2E]/60">Προϊόν</span>
            <span className="font-medium text-[#2E2E2E]">{product.name}</span>
          </div>
          {selectedCut && (
            <div className="flex justify-between">
              <span className="text-[#2E2E2E]/60">Κοπή</span>
              <span className="font-medium text-[#2E2E2E]">{selectedCut.name}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-[#2E2E2E]/60">Βάρος</span>
            <span className="font-medium text-[#2E2E2E]">{formatWeight(weight)}</span>
          </div>
          {notes.trim() && (
            <div className="flex justify-between gap-4">
              <span className="text-[#2E2E2E]/60 shrink-0">Οδηγίες</span>
              <span className="font-medium text-[#2E2E2E] text-right">{notes}</span>
            </div>
          )}
          <div className="border-t border-[#EDE0D0] pt-2 mt-2 flex justify-between">
            <span className="text-[#2E2E2E]/60">Σύνολο</span>
            <span className="text-lg font-bold text-[#C8102E]">{formatPrice(lineTotal)}</span>
          </div>
        </div>

        <button
          onClick={addToCart}
          disabled={added}
          className="w-full bg-[#C8102E] text-white text-sm uppercase tracking-widest py-4 hover:bg-[#8B0000] disabled:bg-green-600 transition-colors"
        >
          {added ? '✓ Προστέθηκε στο καλάθι' : 'Προσθήκη στο καλάθι'}
        </button>
      </div>
    </div>
  )
}
