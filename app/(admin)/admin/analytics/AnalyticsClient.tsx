'use client'

import { useRef } from 'react'

interface KPIs { revenue: number; orderCount: number; aov: number; newCustomers: number }
interface DayRevenue { [day: string]: number }
interface TopProduct { name: string; total: number }
interface FulfillmentSplit { pickup: number; delivery: number }
interface ZoneCount { name: string; count: number }
interface RawOrder { created_at: string; total: number; fulfillment_type: string }

interface Props {
  kpis: KPIs
  revenueByDay: DayRevenue
  topProducts: TopProduct[]
  fulfillmentSplit: FulfillmentSplit
  zoneHeatmap: ZoneCount[]
  rawOrders: RawOrder[]
}

function formatPrice(n: number) { return n.toFixed(2).replace('.', ',') + '€' }

// ── Bar chart (pure CSS) ───────────────────────────────────────────────────────
function BarChart({ data, color = '#C8102E', height = 120 }: {
  data: { label: string; value: number }[]
  color?: string
  height?: number
}) {
  const max = Math.max(...data.map((d) => d.value), 1)
  return (
    <div className="flex items-end gap-1 overflow-x-auto" style={{ height }}>
      {data.map((d) => (
        <div key={d.label} className="flex flex-col items-center gap-1 shrink-0" style={{ minWidth: 24 }}>
          <div
            className="w-5 rounded-sm transition-all"
            style={{ height: Math.max(2, (d.value / max) * (height - 20)), backgroundColor: color }}
            title={`${d.label}: ${formatPrice(d.value)}`}
          />
          <span className="text-[8px] text-[#2E2E2E]/30 rotate-45 origin-left truncate w-4 block">{d.label.slice(5)}</span>
        </div>
      ))}
    </div>
  )
}

// ── Pie chart (SVG) ────────────────────────────────────────────────────────────
function PieChart({ pickup, delivery }: { pickup: number; delivery: number }) {
  const total = pickup + delivery || 1
  const pct   = pickup / total
  const angle = pct * 2 * Math.PI
  const cx = 60, cy = 60, r = 50
  const x1 = cx + r * Math.sin(0)
  const y1 = cy - r * Math.cos(0)
  const x2 = cx + r * Math.sin(angle)
  const y2 = cy - r * Math.cos(angle)
  const large = angle > Math.PI ? 1 : 0

  return (
    <div className="flex items-center gap-6">
      <svg width="120" height="120" viewBox="0 0 120 120">
        {pickup > 0 && delivery > 0 ? (
          <>
            <path d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`} fill="#3b82f6" />
            <path d={`M ${cx} ${cy} L ${x2} ${y2} A ${r} ${r} 0 ${1 - large} 1 ${x1} ${y1} Z`} fill="#C8102E" />
          </>
        ) : (
          <circle cx={cx} cy={cy} r={r} fill={pickup > 0 ? '#3b82f6' : '#C8102E'} />
        )}
      </svg>
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" />
          <span className="text-[#2E2E2E]/70">Παραλαβή: <strong>{pickup}</strong> ({Math.round((pickup / total) * 100)}%)</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="w-3 h-3 rounded-sm bg-[#C8102E] inline-block" />
          <span className="text-[#2E2E2E]/70">Delivery: <strong>{delivery}</strong> ({Math.round((delivery / total) * 100)}%)</span>
        </div>
      </div>
    </div>
  )
}

// ── CSV export ─────────────────────────────────────────────────────────────────
function exportCsv(orders: RawOrder[]) {
  const header = 'date,total,fulfillment_type\n'
  const rows = orders.map((o) =>
    `${o.created_at.slice(0, 10)},${o.total},${o.fulfillment_type}`
  ).join('\n')
  const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function AnalyticsClient({
  kpis, revenueByDay, topProducts, fulfillmentSplit, zoneHeatmap, rawOrders,
}: Props) {
  const chartData = Object.entries(revenueByDay)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([label, value]) => ({ label, value }))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-[#2E2E2E]" style={{ fontFamily: 'var(--font-display)' }}>
          Αναλυτικά
          <span className="ml-2 text-sm font-normal text-[#2E2E2E]/40">Τελευταίες 30 ημέρες</span>
        </h1>
        <button
          onClick={() => exportCsv(rawOrders)}
          className="border border-[#EDE0D0] text-xs uppercase tracking-widest px-4 py-2 text-[#2E2E2E]/60 hover:border-[#C8102E] hover:text-[#C8102E] transition-colors"
        >
          ↓ Export CSV
        </button>
      </div>

      {/* ── KPIs ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Έσοδα',          value: formatPrice(kpis.revenue),           sub: '30 ημέρες' },
          { label: 'Παραγγελίες',    value: String(kpis.orderCount),              sub: '30 ημέρες' },
          { label: 'Μ.Ο. παρ/λίας',  value: formatPrice(kpis.aov),               sub: 'AOV' },
          { label: 'Νέοι πελάτες',   value: String(kpis.newCustomers),            sub: '30 ημέρες' },
        ].map((k) => (
          <div key={k.label} className="bg-white border border-[#EDE0D0] p-5">
            <p className="text-[10px] uppercase tracking-widest text-[#2E2E2E]/40 mb-1">{k.label}</p>
            <p className="text-2xl font-bold text-[#2E2E2E]" style={{ fontFamily: 'var(--font-display)' }}>{k.value}</p>
            <p className="text-xs text-[#2E2E2E]/30 mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Revenue trend ─────────────────────────────────────── */}
      <div className="bg-white border border-[#EDE0D0] p-6 mb-4">
        <h2 className="text-sm font-bold text-[#2E2E2E] uppercase tracking-widest mb-4">Τάση εσόδων (30 ημ.)</h2>
        {chartData.length > 0
          ? <BarChart data={chartData} height={140} />
          : <p className="text-sm text-[#2E2E2E]/40 text-center py-8">Δεν υπάρχουν δεδομένα</p>
        }
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* ── Top products ─────────────────────────────────────── */}
        <div className="bg-white border border-[#EDE0D0] p-6">
          <h2 className="text-sm font-bold text-[#2E2E2E] uppercase tracking-widest mb-4">Top προϊόντα</h2>
          {topProducts.length === 0
            ? <p className="text-sm text-[#2E2E2E]/40 text-center py-4">—</p>
            : (
              <ol className="space-y-2">
                {topProducts.map((p, i) => {
                  const maxVal = topProducts[0].total
                  return (
                    <li key={p.name} className="flex items-center gap-3">
                      <span className="text-xs text-[#2E2E2E]/30 w-4 shrink-0">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[#2E2E2E] truncate">{p.name}</p>
                        <div className="h-1.5 bg-[#EDE0D0] mt-1 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#C8102E] rounded-full"
                            style={{ width: `${(p.total / maxVal) * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#2E2E2E] shrink-0">{formatPrice(p.total)}</span>
                    </li>
                  )
                })}
              </ol>
            )
          }
        </div>

        {/* ── Fulfillment pie ──────────────────────────────────── */}
        <div className="bg-white border border-[#EDE0D0] p-6">
          <h2 className="text-sm font-bold text-[#2E2E2E] uppercase tracking-widest mb-4">Τρόπος παράδοσης</h2>
          <PieChart pickup={fulfillmentSplit.pickup} delivery={fulfillmentSplit.delivery} />
        </div>
      </div>

      {/* ── Zone heatmap ─────────────────────────────────────── */}
      {zoneHeatmap.length > 0 && (
        <div className="bg-white border border-[#EDE0D0] p-6">
          <h2 className="text-sm font-bold text-[#2E2E2E] uppercase tracking-widest mb-4">Παραγγελίες ανά ζώνη</h2>
          <div className="space-y-2">
            {zoneHeatmap.map((z) => {
              const max = zoneHeatmap[0].count
              return (
                <div key={z.name} className="flex items-center gap-3">
                  <p className="text-sm text-[#2E2E2E]/70 w-32 shrink-0 truncate">{z.name}</p>
                  <div className="flex-1 h-5 bg-[#EDE0D0] rounded-sm overflow-hidden">
                    <div
                      className="h-full bg-[#C8102E]/70 rounded-sm"
                      style={{ width: `${(z.count / max) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-[#2E2E2E] w-8 text-right shrink-0">{z.count}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
