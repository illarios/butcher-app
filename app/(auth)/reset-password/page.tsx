'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { resetPasswordAction } from '@/lib/actions/auth'

const initialState = { error: undefined as string | undefined }

export default function ResetPasswordPage() {
  const [state, formAction, pending] = useActionState(resetPasswordAction, initialState)

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="text-center mb-8">
        <Link href="/">
          <h1
            className="text-3xl font-bold tracking-widest uppercase text-[#C8102E]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            ΚΡΕΟΠΩΛΕΙΟ ΜΑΡΚΟΣ
          </h1>
        </Link>
      </div>

      {/* Card */}
      <div className="bg-white border border-[#EDE0D0] p-8">
        <h2
          className="text-xl font-semibold text-[#2E2E2E] mb-2"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Νέος κωδικός
        </h2>
        <p className="text-sm text-[#666] mb-6">
          Επιλέξτε έναν νέο κωδικό για τον λογαριασμό σας.
        </p>

        <form action={formAction} className="space-y-6">
          {/* New password */}
          <div>
            <label htmlFor="password" className="block text-xs uppercase tracking-widest text-[#2E2E2E] mb-2">
              Νέος κωδικός
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full bg-transparent border-b-2 border-[#EDE0D0] focus:border-[#C8102E] outline-none py-2 text-[#2E2E2E] text-sm transition-colors"
            />
            <p className="text-xs text-[#999] mt-1">Τουλάχιστον 8 χαρακτήρες.</p>
          </div>

          {/* Error */}
          {state?.error && (
            <p className="text-sm text-[#C8102E]">{state.error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={pending}
            className="w-full bg-[#C8102E] text-white text-sm uppercase tracking-widest py-3 hover:bg-[#8B0000] disabled:opacity-60 transition-colors"
          >
            {pending ? 'Αποθήκευση…' : 'Αποθήκευση νέου κωδικού'}
          </button>
        </form>
      </div>
    </div>
  )
}
