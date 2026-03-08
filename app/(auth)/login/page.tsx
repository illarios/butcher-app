'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { loginAction } from '@/lib/actions/auth'

const initialState = { error: undefined as string | undefined }

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initialState)

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
          className="text-xl font-semibold text-[#2E2E2E] mb-6"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Σύνδεση
        </h2>

        <form action={formAction} className="space-y-6">
          {/* Email */}
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

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="password" className="block text-xs uppercase tracking-widest text-[#2E2E2E]">
                Κωδικός
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-[#C8102E] hover:underline"
              >
                Ξεχάσατε τον κωδικό;
              </Link>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full bg-transparent border-b-2 border-[#EDE0D0] focus:border-[#C8102E] outline-none py-2 text-[#2E2E2E] text-sm transition-colors"
            />
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
            {pending ? 'Σύνδεση…' : 'Σύνδεση'}
          </button>
        </form>

        <p className="text-center text-sm text-[#2E2E2E] mt-6">
          Δεν έχετε λογαριασμό;{' '}
          <Link href="/register" className="text-[#C8102E] hover:underline font-medium">
            Εγγραφή
          </Link>
        </p>
      </div>
    </div>
  )
}
