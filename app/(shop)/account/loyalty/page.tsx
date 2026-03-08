import { redirect } from 'next/navigation'
import { getProfile, getLoyaltyTransactions } from '@/lib/queries/account'

// ── Tier config ────────────────────────────────────────────────────────────────
const TIER_THRESHOLDS = { bronze: 0, silver: 500, gold: 2000 }

const TIER_CONFIG = {
  bronze: {
    label:       'Bronze',
    next:        'Silver',
    nextAt:      500,
    color:       'text-amber-700',
    bg:          'bg-amber-50 border-amber-200',
    bar:         'bg-amber-400',
    description: 'Ξεκινήστε να μαζεύετε πόντους!',
  },
  silver: {
    label:       'Silver',
    next:        'Gold',
    nextAt:      2000,
    color:       'text-slate-600',
    bg:          'bg-slate-50 border-slate-200',
    bar:         'bg-slate-400',
    description: 'Συνεχίστε να παραγγέλνετε για να φτάσετε στο Gold!',
  },
  gold: {
    label:       'Gold',
    next:        null,
    nextAt:      null,
    color:       'text-yellow-700',
    bg:          'bg-yellow-50 border-yellow-200',
    bar:         'bg-yellow-400',
    description: 'Είστε στο ανώτατο επίπεδο! Απολαύστε τα αποκλειστικά προνόμια.',
  },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('el-GR', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default async function LoyaltyPage() {
  const profile = await getProfile()
  if (!profile) redirect('/login?next=/account/loyalty')

  const transactions = await getLoyaltyTransactions()
  const tier         = profile.loyalty_tier ?? 'bronze'
  const cfg          = TIER_CONFIG[tier]
  const points       = profile.loyalty_points

  // Progress to next tier
  const currentFloor = TIER_THRESHOLDS[tier]
  const nextCeiling  = cfg.nextAt ?? currentFloor
  const progress     = cfg.nextAt
    ? Math.min(100, Math.round(((points - currentFloor) / (nextCeiling - currentFloor)) * 100))
    : 100

  const pointsToNext = cfg.nextAt ? Math.max(0, cfg.nextAt - points) : 0

  return (
    <div>
      <div className="mb-6">
        <h1
          className="text-2xl font-bold text-[#2E2E2E]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Loyalty
        </h1>
        <p className="text-sm text-[#2E2E2E]/50 mt-1">Οι πόντοι σας και το ιστορικό</p>
      </div>

      <div className="space-y-4">

        {/* ── Points card ────────────────────────────────────── */}
        <div className="bg-[#0D0D0D] text-white p-8 relative overflow-hidden">
          {/* Grain texture */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }}
          />
          <div className="relative z-10">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-2">
              Διαθέσιμοι πόντοι
            </p>
            <p className="text-6xl font-bold text-[#C8102E]" style={{ fontFamily: 'var(--font-display)' }}>
              {points.toLocaleString('el-GR')}
            </p>
            <p className="text-white/40 text-xs mt-2">
              = {(points / 100).toFixed(2).replace('.', ',')}€ έκπτωση
            </p>
          </div>
        </div>

        {/* ── Tier card ───────────────────────────────────────── */}
        <div className={`border p-6 ${cfg.bg}`}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className={`text-sm font-bold uppercase tracking-widest ${cfg.color}`}>✦ {cfg.label}</p>
              <p className="text-xs text-[#2E2E2E]/60 mt-0.5">{cfg.description}</p>
            </div>
            {cfg.next && (
              <div className="text-right">
                <p className="text-xs text-[#2E2E2E]/50">Επόμενο επίπεδο</p>
                <p className={`text-sm font-bold ${cfg.color}`}>{cfg.next}</p>
              </div>
            )}
          </div>

          {/* Progress bar */}
          {cfg.nextAt && (
            <div>
              <div className="h-2 bg-black/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${cfg.bar}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-[#2E2E2E]/50 mt-1">
                <span>{points.toLocaleString('el-GR')} πόντοι</span>
                {pointsToNext > 0 && (
                  <span>Ακόμα {pointsToNext.toLocaleString('el-GR')} πόντοι για {cfg.next}</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── How it works ────────────────────────────────────── */}
        <div className="bg-white border border-[#EDE0D0] p-6">
          <h2 className="text-sm font-bold text-[#2E2E2E] uppercase tracking-widest mb-4">
            Πώς λειτουργεί
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: '🛒', title: '1 πόντος / €1',  desc: 'Κερδίζετε 1 πόντο για κάθε €1 που ξοδεύετε.' },
              { icon: '✦', title: '100 πόντοι = €1', desc: 'Εξαργυρώστε 100 πόντους για €1 έκπτωση στο checkout.' },
              { icon: '🎁', title: '50 πόντοι δώρο', desc: 'Πήρατε 50 πόντους καλωσορίσματος με την εγγραφή σας.' },
            ].map((item) => (
              <div key={item.title} className="text-center p-4 bg-[#F5EFE6]">
                <p className="text-3xl mb-2">{item.icon}</p>
                <p className="text-xs font-bold text-[#2E2E2E] uppercase tracking-wide mb-1">{item.title}</p>
                <p className="text-xs text-[#2E2E2E]/60 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Transaction history ─────────────────────────────── */}
        <div className="bg-white border border-[#EDE0D0]">
          <div className="px-6 py-4 border-b border-[#EDE0D0]">
            <h2 className="text-sm font-bold text-[#2E2E2E] uppercase tracking-widest">
              Ιστορικό πόντων
            </h2>
          </div>
          {transactions.length === 0 ? (
            <p className="p-6 text-sm text-[#2E2E2E]/40 text-center">Δεν υπάρχουν συναλλαγές ακόμα.</p>
          ) : (
            <ul className="divide-y divide-[#EDE0D0]">
              {transactions.map((tx) => (
                <li key={tx.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="text-sm text-[#2E2E2E]">{tx.description ?? (tx.type === 'earn' ? 'Κέρδος πόντων' : 'Εξαργύρωση')}</p>
                    <p className="text-xs text-[#2E2E2E]/40 mt-0.5">{formatDate(tx.created_at)}</p>
                  </div>
                  <span className={`text-sm font-bold ${tx.type === 'earn' ? 'text-green-700' : 'text-red-600'}`}>
                    {tx.type === 'earn' ? '+' : '−'}{tx.points} πόντοι
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  )
}
