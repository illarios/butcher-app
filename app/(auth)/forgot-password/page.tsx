'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { forgotPasswordAction } from '@/lib/actions/auth'

const initialState = { error: undefined as string | undefined, success: undefined as string | undefined }

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, initialState)

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
          Επαναφορά κωδικού
        </h2>
        <p className="text-sm text-[#666] mb-6">
          Εισάγετε το email σας και θα σας στείλουμε οδηγίες επαναφοράς.
        </p>

        {state?.success ? (
          <div className="space-y-4">
            <p className="text-sm text-[#2E2E2E] leading-relaxed">{state.success}</p>
            <Link
              href="/login"
              className="block text-center bg-[#C8102E] text-white text-sm uppercase tracking-widest py-3 hover:bg-[#8B0000] transition-colors"
            >
              Επιστροφή στη σύνδεση
            </Link>
          </div>
        ) : (
          <form action={formAction} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-xs uppercase tracking-widest text-[#2E2E2E] mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full bg-transparent border-b-2 border-[#EDE0D0] focus:border-[#C8102E] outline-none py-2 text-[#2E2E2E] text-sm transition-colors"
              />
            </div>

            {state?.error && (
              <p className="text-sm text-[#C8102E]">{state.error}</p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full bg-[#C8102E] text-white text-sm uppercase tracking-widest py-3 hover:bg-[#8B0000] disabled:opacity-60 transition-colors"
            >
              {pending ? 'Αποστολή…' : 'Αποστολή οδηγιών'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-[#2E2E2E] mt-6">
          <Link href="/login" className="text-[#C8102E] hover:underline">
            ← Επιστροφή στη σύνδεση
          </Link>
        </p>
      </div>
    </div>
  )
}
