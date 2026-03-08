import { redirect } from 'next/navigation'
import { logoutAction } from '@/lib/actions/auth'
import { getProfile } from '@/lib/queries/account'
import AccountNav from './AccountNav'

// ── Tier config ────────────────────────────────────────────────────────────────
const TIER_CONFIG = {
  bronze: { label: 'Bronze',  color: 'text-amber-700  bg-amber-50  border-amber-200' },
  silver: { label: 'Silver',  color: 'text-slate-600  bg-slate-50  border-slate-200' },
  gold:   { label: 'Gold',    color: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
}

// ── Initials helper ────────────────────────────────────────────────────────────
function initials(name?: string) {
  if (!name) return '?'
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
}

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile()
  if (!profile) redirect('/login?next=/account')

  const tier = TIER_CONFIG[profile.loyalty_tier ?? 'bronze']

  return (
    <div className="min-h-screen bg-[#F5EFE6]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col md:flex-row gap-8">

          {/* ── Sidebar ──────────────────────────────────────── */}
          <aside className="md:w-64 shrink-0">
            <div className="bg-white border border-[#EDE0D0]">

              {/* Avatar + info */}
              <div className="p-6 border-b border-[#EDE0D0]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#C8102E] flex items-center justify-center text-white font-bold text-lg shrink-0">
                    {initials(profile.full_name)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-[#2E2E2E] text-sm truncate">
                      {profile.full_name ?? 'Χρήστης'}
                    </p>
                    <span className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold border px-2 py-0.5 mt-1 ${tier.color}`}>
                      ✦ {tier.label}
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-[#2E2E2E]/60">
                  <span>Πόντοι</span>
                  <span className="font-bold text-[#C8102E] text-sm">{profile.loyalty_points}</span>
                </div>
              </div>

              {/* Nav */}
              <AccountNav />

              {/* Logout */}
              <div className="p-4 border-t border-[#EDE0D0]">
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="w-full text-xs uppercase tracking-widest text-[#2E2E2E]/40 hover:text-[#C8102E] transition-colors py-2"
                  >
                    Αποσύνδεση
                  </button>
                </form>
              </div>
            </div>
          </aside>

          {/* ── Main content ─────────────────────────────────── */}
          <main className="flex-1 min-w-0">{children}</main>

        </div>
      </div>
    </div>
  )
}
