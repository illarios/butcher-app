'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Store, Truck, CheckCircle2, AlertCircle } from 'lucide-react'
import { useCartStore, itemTotal } from '@/lib/stores/cart'
import type { Address } from '@/types'

// ── Types ─────────────────────────────────────────────────────────────────────
type FulfillmentType = 'pickup' | 'delivery'

interface ZoneResult {
  covered: boolean
  zone?: { id: string; name: string; fee: number; minutes: number; minOrder: number }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatEur(n: number): string {
  return n.toFixed(2).replace('.', ',') + '€'
}

function formatWeight(grams: number): string {
  if (grams >= 1000) return `${(grams / 1000).toFixed(grams % 1000 === 0 ? 0 : 1)} κιλά`
  return `${grams} γρ`
}

// ── Sub-components ────────────────────────────────────────────────────────────
function StepIndicator({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center gap-4 mb-10">
      {[1, 2].map((n) => (
        <div key={n} className="flex items-center gap-2">
          <span
            className={`w-7 h-7 flex items-center justify-center text-xs font-bold border ${
              n === step
                ? 'bg-[#C8102E] text-white border-[#C8102E]'
                : n < step
                ? 'bg-[#2E2E2E] text-white border-[#2E2E2E]'
                : 'border-[#EDE0D0] text-[#2E2E2E]/40'
            }`}
          >
            {n < step ? '✓' : n}
          </span>
          <span className={`text-xs uppercase tracking-widest ${n === step ? 'text-[#2E2E2E]' : 'text-[#2E2E2E]/40'}`}>
            {n === 1 ? 'Τρόπος παραλαβής' : 'Επιβεβαίωση'}
          </span>
          {n < 2 && <span className="text-[#EDE0D0] ml-4">—</span>}
        </div>
      ))}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const router = useRouter()
  const { items, clearCart, subtotal, loyaltyPointsEstimate } = useCartStore()

  const [step, setStep]                   = useState<1 | 2>(1)
  const [fulfillment, setFulfillment]     = useState<FulfillmentType | null>(null)
  const [address, setAddress]             = useState<Partial<Address>>({})
  const [zoneResult, setZoneResult]       = useState<ZoneResult | null>(null)
  const [zoneLoading, setZoneLoading]     = useState(false)
  const [loyaltyUse, setLoyaltyUse]       = useState(0)
  const [availablePoints, setAvailablePoints] = useState(0)
  const [submitting, setSubmitting]       = useState(false)
  const [submitError, setSubmitError]     = useState<string | null>(null)

  // Redirect empty cart
  useEffect(() => {
    if (items.length === 0) router.replace('/products')
  }, [items, router])

  // Fetch user's loyalty points
  useEffect(() => {
    fetch('/api/account/loyalty-points')
      .then((r) => r.json())
      .then((d) => { if (d.points) setAvailablePoints(d.points) })
      .catch(() => {})
  }, [])

  // Postal code zone check (debounced)
  const checkZone = useCallback(async (postal: string) => {
    if (!/^\d{5}$/.test(postal)) { setZoneResult(null); return }
    setZoneLoading(true)
    try {
      const res  = await fetch(`/api/delivery-zones/check?postal=${postal}`)
      const data = await res.json()
      setZoneResult(data)
    } finally {
      setZoneLoading(false)
    }
  }, [])

  useEffect(() => {
    if (fulfillment !== 'delivery' || !address.postal_code) return
    const t = setTimeout(() => checkZone(address.postal_code!), 600)
    return () => clearTimeout(t)
  }, [address.postal_code, fulfillment, checkZone])

  // Derived
  const sub             = subtotal()
  const deliveryFee     = zoneResult?.zone?.fee ?? 0
  const loyaltyDiscount = loyaltyUse / 100
  const total           = Math.max(0, sub + (fulfillment === 'delivery' ? deliveryFee : 0) - loyaltyDiscount)
  const pointsEarned    = Math.floor(total)

  const canProceed =
    fulfillment === 'pickup' ||
    (fulfillment === 'delivery' &&
      zoneResult?.covered &&
      address.street && address.city && address.postal_code)

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!canProceed || submitting) return
    setSubmitting(true)
    setSubmitError(null)

    try {
      const res = await fetch('/api/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          fulfillmentType:  fulfillment,
          deliveryZoneId:   zoneResult?.zone?.id,
          deliveryAddress:  fulfillment === 'delivery' ? address : undefined,
          loyaltyPointsUsed: loyaltyUse,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setSubmitError(data.error ?? 'Σφάλμα'); return }
      clearCart()
      router.push(`/checkout/success?order=${data.orderNumber}&points=${data.pointsEarned}`)
    } catch {
      setSubmitError('Παρουσιάστηκε σφάλμα. Παρακαλώ δοκιμάστε ξανά.')
    } finally {
      setSubmitting(false)
    }
  }

  if (items.length === 0) return null

  // ═════════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[#F5EFE6]">
      {/* Page header */}
      <div className="bg-white border-b border-[#EDE0D0] py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h1 className="text-2xl font-bold text-[#2E2E2E]" style={{ fontFamily: 'var(--font-display)' }}>
            Ολοκλήρωση παραγγελίας
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <StepIndicator step={step} />

        {/* ════ STEP 1: Fulfillment ════════════════════════════════════════════ */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-[#2E2E2E]" style={{ fontFamily: 'var(--font-display)' }}>
              Πώς θα παραλάβετε την παραγγελία σας;
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Pickup card */}
              <button
                onClick={() => { setFulfillment('pickup'); setZoneResult(null) }}
                className={`flex flex-col items-start gap-4 p-6 border-2 text-left transition-colors ${
                  fulfillment === 'pickup'
                    ? 'border-[#C8102E] bg-[#C8102E]/5'
                    : 'border-[#EDE0D0] bg-white hover:border-[#C8102E]/40'
                }`}
              >
                <Store size={32} strokeWidth={1.2} className={fulfillment === 'pickup' ? 'text-[#C8102E]' : 'text-[#2E2E2E]/40'} />
                <div>
                  <p className="font-bold text-[#2E2E2E] text-base">Παραλαβή από το κατάστημα</p>
                  <p className="text-xs text-[#2E2E2E]/60 mt-1">Πληρωμή κατά την παραλαβή</p>
                  <p className="text-xs text-[#2E2E2E]/50 mt-3 leading-relaxed">
                    Ιθάκης 12, Αθήνα<br />
                    Δευ–Παρ 07:00–20:00 · Σαβ 07:00–17:00
                  </p>
                  <span className="inline-block mt-3 text-[10px] uppercase tracking-widest bg-[#F5EFE6] text-[#2E2E2E]/60 px-2 py-1">
                    Δωρεάν
                  </span>
                </div>
              </button>

              {/* Delivery card */}
              <button
                onClick={() => setFulfillment('delivery')}
                className={`flex flex-col items-start gap-4 p-6 border-2 text-left transition-colors ${
                  fulfillment === 'delivery'
                    ? 'border-[#C8102E] bg-[#C8102E]/5'
                    : 'border-[#EDE0D0] bg-white hover:border-[#C8102E]/40'
                }`}
              >
                <Truck size={32} strokeWidth={1.2} className={fulfillment === 'delivery' ? 'text-[#C8102E]' : 'text-[#2E2E2E]/40'} />
                <div>
                  <p className="font-bold text-[#2E2E2E] text-base">Διανομή στο σπίτι</p>
                  <p className="text-xs text-[#2E2E2E]/60 mt-1">Πληρωμή κατά την παράδοση</p>
                  <p className="text-xs text-[#2E2E2E]/50 mt-3 leading-relaxed">
                    Παράδοση εντός 45–60 λεπτών<br />
                    Κάλυψη επιλεγμένων περιοχών Αθήνας
                  </p>
                </div>
              </button>
            </div>

            {/* Delivery address form */}
            {fulfillment === 'delivery' && (
              <div className="bg-white border border-[#EDE0D0] p-6 space-y-4">
                <h3 className="text-xs uppercase tracking-widest text-[#2E2E2E]/60 mb-2">
                  Διεύθυνση παράδοσης
                </h3>

                {/* Postal code + zone check */}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#2E2E2E] mb-2">
                    Ταχυδρομικός Κώδικας *
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      maxLength={5}
                      placeholder="10431"
                      value={address.postal_code ?? ''}
                      onChange={(e) => setAddress((a) => ({ ...a, postal_code: e.target.value }))}
                      className="w-32 bg-transparent border-b-2 border-[#EDE0D0] focus:border-[#C8102E] outline-none py-2 text-sm text-[#2E2E2E] transition-colors"
                    />
                    {zoneLoading && (
                      <span className="text-xs text-[#2E2E2E]/40 animate-pulse">Έλεγχος…</span>
                    )}
                  </div>

                  {/* Zone result badge */}
                  {zoneResult && !zoneLoading && (
                    <div className={`flex items-start gap-2 mt-3 p-3 text-sm ${
                      zoneResult.covered
                        ? 'bg-green-50 border border-green-200 text-green-800'
                        : 'bg-red-50 border border-red-200 text-red-800'
                    }`}>
                      {zoneResult.covered ? (
                        <>
                          <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold">Η περιοχή σας καλύπτεται!</p>
                            <p className="text-xs mt-0.5">
                              Ζώνη: {zoneResult.zone!.name} · Έξοδα: {formatEur(zoneResult.zone!.fee)} · ~{zoneResult.zone!.minutes} λεπτά
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <AlertCircle size={16} className="shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold">Δυστυχώς δεν κάνουμε delivery στην περιοχή σας.</p>
                            <button
                              onClick={() => setFulfillment('pickup')}
                              className="text-xs underline mt-1"
                            >
                              Επιλέξτε Παραλαβή από το κατάστημα
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs uppercase tracking-widest text-[#2E2E2E] mb-2">Οδός *</label>
                    <input
                      type="text"
                      value={address.street ?? ''}
                      onChange={(e) => setAddress((a) => ({ ...a, street: e.target.value }))}
                      className="w-full bg-transparent border-b-2 border-[#EDE0D0] focus:border-[#C8102E] outline-none py-2 text-sm text-[#2E2E2E] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-[#2E2E2E] mb-2">Αριθμός</label>
                    <input
                      type="text"
                      value={address.number ?? ''}
                      onChange={(e) => setAddress((a) => ({ ...a, number: e.target.value }))}
                      className="w-full bg-transparent border-b-2 border-[#EDE0D0] focus:border-[#C8102E] outline-none py-2 text-sm text-[#2E2E2E] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-[#2E2E2E] mb-2">Πόλη *</label>
                    <input
                      type="text"
                      value={address.city ?? ''}
                      onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
                      className="w-full bg-transparent border-b-2 border-[#EDE0D0] focus:border-[#C8102E] outline-none py-2 text-sm text-[#2E2E2E] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-[#2E2E2E] mb-2">Όροφος</label>
                    <input
                      type="text"
                      value={address.floor ?? ''}
                      onChange={(e) => setAddress((a) => ({ ...a, floor: e.target.value }))}
                      className="w-full bg-transparent border-b-2 border-[#EDE0D0] focus:border-[#C8102E] outline-none py-2 text-sm text-[#2E2E2E] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#2E2E2E] mb-2">Σχόλια διεύθυνσης</label>
                  <input
                    type="text"
                    placeholder="πχ. 2ος όροφος, κουδούνι Παπαδόπουλος"
                    value={address.notes ?? ''}
                    onChange={(e) => setAddress((a) => ({ ...a, notes: e.target.value }))}
                    className="w-full bg-transparent border-b-2 border-[#EDE0D0] focus:border-[#C8102E] outline-none py-2 text-sm text-[#2E2E2E] transition-colors"
                  />
                </div>
              </div>
            )}

            <button
              disabled={!canProceed}
              onClick={() => setStep(2)}
              className="w-full bg-[#C8102E] text-white text-sm uppercase tracking-widest py-4 hover:bg-[#8B0000] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Συνέχεια →
            </button>
          </div>
        )}

        {/* ════ STEP 2: Summary + Confirm ══════════════════════════════════════ */}
        {step === 2 && (
          <div className="space-y-6">
            <button
              onClick={() => setStep(1)}
              className="text-xs uppercase tracking-widest text-[#C8102E] hover:underline"
            >
              ← Επιστροφή
            </button>

            {/* Order summary */}
            <div className="bg-white border border-[#EDE0D0] p-6">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-[#2E2E2E]/60 mb-4">
                Σύνοψη παραγγελίας
              </h2>

              <ul className="divide-y divide-[#EDE0D0] mb-4">
                {items.map((item) => (
                  <li key={item.key} className="flex justify-between py-3 text-sm">
                    <div>
                      <p className="font-semibold text-[#2E2E2E]">{item.productName}</p>
                      {item.cutName && <p className="text-xs text-[#2E2E2E]/50">{item.cutName}</p>}
                      <p className="text-xs text-[#2E2E2E]/50">{formatWeight(item.weightGrams)}</p>
                    </div>
                    <span className="font-bold text-[#2E2E2E] shrink-0 ml-4">
                      {formatEur(itemTotal(item))}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Totals */}
              <div className="space-y-1.5 text-sm border-t border-[#EDE0D0] pt-4">
                <div className="flex justify-between text-[#2E2E2E]/60">
                  <span>Υποσύνολο</span><span>{formatEur(sub)}</span>
                </div>
                {fulfillment === 'delivery' && (
                  <div className="flex justify-between text-[#2E2E2E]/60">
                    <span>Έξοδα παράδοσης</span>
                    <span>{deliveryFee > 0 ? formatEur(deliveryFee) : 'Δωρεάν'}</span>
                  </div>
                )}
                {loyaltyUse > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>Έκπτωση πόντων ({loyaltyUse} πόντοι)</span>
                    <span>-{formatEur(loyaltyDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-[#2E2E2E] text-base pt-2 border-t border-[#EDE0D0]">
                  <span>ΣΥΝΟΛΟ</span>
                  <span className="text-[#C8102E]">{formatEur(total)}</span>
                </div>
              </div>
            </div>

            {/* Loyalty redemption */}
            {availablePoints >= 100 && (
              <div className="bg-white border border-[#EDE0D0] p-6">
                <h3 className="text-xs uppercase tracking-widest text-[#2E2E2E]/60 mb-3">
                  Πόντοι επιβράβευσης
                </h3>
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="text-[#2E2E2E]">Διαθέσιμοι πόντοι: <strong className="text-[#C8102E]">{availablePoints}</strong></span>
                  <span className="text-[#2E2E2E]/60">= {formatEur(availablePoints / 100)} έκπτωση</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={Math.min(availablePoints, Math.floor(sub * 100))}
                  step={100}
                  value={loyaltyUse}
                  onChange={(e) => setLoyaltyUse(Number(e.target.value))}
                  className="w-full accent-[#C8102E]"
                />
                <div className="flex justify-between text-xs text-[#2E2E2E]/40 mt-1">
                  <span>0</span>
                  <span>{loyaltyUse > 0 ? `Χρήση ${loyaltyUse} πόντων (-${formatEur(loyaltyUse / 100)})` : 'Δεν χρησιμοποιείτε πόντους'}</span>
                </div>
              </div>
            )}

            {/* COD info box */}
            <div className="flex gap-3 bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
              <span className="text-lg shrink-0">💳</span>
              <p>
                <strong>Η πληρωμή γίνεται κατά την {fulfillment === 'pickup' ? 'παραλαβή' : 'παράδοση'}.</strong><br />
                Δεν απαιτείται κάρτα — μετρητά ή κάρτα στον διανομέα.
              </p>
            </div>

            {/* Points earned preview */}
            <div className="text-center text-xs text-[#2E2E2E]/50">
              Θα κερδίσετε <strong className="text-[#C8102E]">{pointsEarned} πόντους</strong> με αυτή την παραγγελία.
            </div>

            {/* Error */}
            {submitError && (
              <p className="text-sm text-[#C8102E] text-center">{submitError}</p>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-[#C8102E] text-white text-sm uppercase tracking-widest py-5 hover:bg-[#8B0000] disabled:opacity-60 transition-colors text-base"
            >
              {submitting ? 'Υποβολή…' : 'Υποβολή Παραγγελίας'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
