'use client'

import { useActionState, useState, useTransition } from 'react'
import { updateProfileAction, updateAddressAction, changePasswordAction } from '@/lib/actions/account'
import type { Profile } from '@/types'

interface ProfileAddress {
  street: string
  number: string
  city: string
  postal_code: string
  floor?: string
  notes?: string
}

interface Props {
  profile: Profile
}

// ── Section wrapper ────────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#EDE0D0]">
      <div className="px-6 py-4 border-b border-[#EDE0D0]">
        <h2 className="text-sm font-bold text-[#2E2E2E] uppercase tracking-widest">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

// ── Field ──────────────────────────────────────────────────────────────────────
function Field({
  label, name, type = 'text', defaultValue, required, placeholder,
}: {
  label: string; name: string; type?: string; defaultValue?: string
  required?: boolean; placeholder?: string
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-widest text-[#2E2E2E]/50 mb-1.5">
        {label}
      </label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue ?? ''}
        required={required}
        placeholder={placeholder}
        className="w-full border border-[#EDE0D0] bg-white px-4 py-2.5 text-sm text-[#2E2E2E] placeholder:text-[#2E2E2E]/30 focus:outline-none focus:border-[#C8102E] transition-colors"
      />
    </div>
  )
}

// ── Result banner ──────────────────────────────────────────────────────────────
function ResultBanner({ state }: { state: { error?: string; success?: string } | null }) {
  if (!state?.error && !state?.success) return null
  return (
    <div className={`text-sm px-4 py-3 border ${
      state.error
        ? 'bg-red-50 border-red-200 text-red-700'
        : 'bg-green-50 border-green-200 text-green-700'
    }`}>
      {state.error ?? state.success}
    </div>
  )
}

// ── Main form component ────────────────────────────────────────────────────────
export default function ProfileForm({ profile }: Props) {
  const [profileState, profileAction]   = useActionState(updateProfileAction, null)
  const [passwordState, passwordAction] = useActionState(changePasswordAction, null)

  const [addressMsg,  setAddressMsg]  = useState<{ error?: string; success?: string } | null>(null)
  const [zoneInfo,    setZoneInfo]    = useState<{ inZone: boolean; zoneName?: string } | null>(null)
  const [, startTransition] = useTransition()

  const addr = profile.address as ProfileAddress | undefined

  const handleAddressSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await updateAddressAction(fd) as {
        error?: string; success?: string; inZone?: boolean; zoneName?: string
      } | null
      if (!result) return
      setAddressMsg({ error: result.error, success: result.success })
      if ('inZone' in result) {
        setZoneInfo({ inZone: !!result.inZone, zoneName: result.zoneName })
      }
    })
  }

  return (
    <div className="space-y-4">

      {/* ── Personal details ─────────────────────────────────── */}
      <Section title="Προσωπικά στοιχεία">
        <form action={profileAction}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <Field label="Ονοματεπώνυμο" name="full_name" defaultValue={profile.full_name} required />
            <Field label="Τηλέφωνο" name="phone" type="tel" defaultValue={profile.phone} placeholder="69xxxxxxxx" />
          </div>
          <div className="mb-4">
            <Field label="Γενέθλια" name="birthday" type="date" defaultValue={profile.birthday} />
          </div>
          <ResultBanner state={profileState} />
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              className="bg-[#C8102E] text-white text-xs uppercase tracking-widest px-6 py-2.5 hover:bg-[#8B0000] transition-colors"
            >
              Αποθήκευση
            </button>
          </div>
        </form>
      </Section>

      {/* ── Saved address ────────────────────────────────────── */}
      <Section title="Αποθηκευμένη διεύθυνση">
        <form onSubmit={handleAddressSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="sm:col-span-2">
              <Field label="Οδός" name="street" defaultValue={addr?.street} placeholder="Σταδίου" />
            </div>
            <Field label="Αριθμός" name="number" defaultValue={addr?.number} placeholder="12" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="sm:col-span-2">
              <Field label="Πόλη" name="city" defaultValue={addr?.city} placeholder="Αθήνα" />
            </div>
            <Field label="Τ.Κ." name="postal_code" defaultValue={addr?.postal_code} placeholder="10431" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <Field label="Όροφος" name="floor" defaultValue={addr?.floor} placeholder="2ος" />
            <Field label="Οδηγίες παράδοσης" name="address_notes" defaultValue={addr?.notes} placeholder="Κτυπήστε κουδούνι..." />
          </div>

          {/* Zone badge */}
          {zoneInfo !== null && (
            <div className={`text-xs px-3 py-2 border mb-4 flex items-center gap-2 ${
              zoneInfo.inZone
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              {zoneInfo.inZone
                ? <>✓ Η περιοχή σας καλύπτεται από τη ζώνη <strong>{zoneInfo.zoneName}</strong></>
                : '✕ Η περιοχή σας δεν καλύπτεται από τις ζώνες διανομής μας'}
            </div>
          )}

          <ResultBanner state={addressMsg} />
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              className="bg-[#C8102E] text-white text-xs uppercase tracking-widest px-6 py-2.5 hover:bg-[#8B0000] transition-colors"
            >
              Αποθήκευση διεύθυνσης
            </button>
          </div>
        </form>
      </Section>

      {/* ── Change password ──────────────────────────────────── */}
      <Section title="Αλλαγή κωδικού">
        <form action={passwordAction}>
          <div className="space-y-4 mb-4">
            <Field label="Τρέχων κωδικός" name="current_password" type="password" required />
            <Field label="Νέος κωδικός" name="new_password" type="password" required placeholder="Τουλάχιστον 8 χαρακτήρες" />
            <Field label="Επιβεβαίωση νέου κωδικού" name="confirm_password" type="password" required />
          </div>
          <ResultBanner state={passwordState} />
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              className="bg-[#2E2E2E] text-white text-xs uppercase tracking-widest px-6 py-2.5 hover:bg-black transition-colors"
            >
              Αλλαγή κωδικού
            </button>
          </div>
        </form>
      </Section>

    </div>
  )
}
