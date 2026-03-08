'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { registerAction } from '@/lib/actions/auth'

const initialState = { error: undefined as string | undefined, success: undefined as string | undefined }

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(registerAction, initialState)

  if (state?.success) {
    return (
      <div className="w-full max-w-md">
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
        <div className="bg-white border border-[#EDE0D0] p-8 text-center">
          <p className="text-[#2E2E2E] text-sm leading-relaxed">{state.success}</p>
          <Link
            href="/login"
            className="inline-block mt-6 bg-[#C8102E] text-white text-sm uppercase tracking-widest px-8 py-3 hover:bg-[#8B0000] transition-colors"
          >
            Σύνδεση
          </Link>
        </div>
      </div>
    )
  }

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
          className="text-xl font-semibold text-[#2E2E2E] mb-1"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Δημιουργία λογαριασμού
        </h2>
        <p className="text-xs text-[#666] mb-6">
          Κερδίστε <span className="text-[#C8102E] font-semibold">50 πόντους</span> καλωσορίσματος.
        </p>

        <form action={formAction} className="space-y-5">
          {/* Full name */}
          <div>
            <label htmlFor="full_name" className="block text-xs uppercase tracking-widest text-[#2E2E2E] mb-2">
              Ονοματεπώνυμο
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              required
              autoComplete="name"
              className="w-full bg-transparent border-b-2 border-[#EDE0D0] focus:border-[#C8102E] outline-none py-2 text-[#2E2E2E] text-sm transition-colors"
            />
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-xs uppercase tracking-widest text-[#2E2E2E] mb-2">
              Τηλέφωνο
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              className="w-full bg-transparent border-b-2 border-[#EDE0D0] focus:border-[#C8102E] outline-none py-2 text-[#2E2E2E] text-sm transition-colors"
            />
          </div>

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
            <label htmlFor="password" className="block text-xs uppercase tracking-widest text-[#2E2E2E] mb-2">
              Κωδικός
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
            className="w-full bg-[#C8102E] text-white text-sm uppercase tracking-widest py-3 hover:bg-[#8B0000] disabled:opacity-60 transition-colors mt-2"
          >
            {pending ? 'Δημιουργία…' : 'Δημιουργία λογαριασμού'}
          </button>
        </form>

        <p className="text-center text-sm text-[#2E2E2E] mt-6">
          Έχετε ήδη λογαριασμό;{' '}
          <Link href="/login" className="text-[#C8102E] hover:underline font-medium">
            Σύνδεση
          </Link>
        </p>
      </div>
    </div>
  )
}
