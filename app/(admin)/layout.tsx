import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logoutAction } from '@/lib/actions/auth'
import AdminNav from './AdminNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/admin')

  const { count: pendingCount } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending')

  return (
    <div className="min-h-screen flex bg-[#111]">
      <aside className="w-56 shrink-0 bg-black flex flex-col border-r border-white/10">
        <div className="px-5 py-5 border-b border-white/10">
          <Link href="/admin" className="block">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 mb-0.5">Admin</p>
            <p className="text-white font-bold text-sm" style={{ fontFamily: 'var(--font-display)' }}>
              Κρεοπωλείο Μάρκος
            </p>
          </Link>
        </div>
        <AdminNav pendingCount={pendingCount ?? 0} />
        <div className="mt-auto p-4 border-t border-white/10">
          <form action={logoutAction}>
            <button type="submit" className="w-full text-[10px] uppercase tracking-widest text-white/30 hover:text-white transition-colors py-2 text-left">
              Αποσύνδεση
            </button>
          </form>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 bg-[#F5EFE6]">
        <header className="h-12 bg-white border-b border-[#EDE0D0] flex items-center justify-between px-6 shrink-0">
          <p className="text-xs text-[#2E2E2E]/40 uppercase tracking-widest">Dashboard</p>
          <div className="flex items-center gap-3">
            {(pendingCount ?? 0) > 0 && (
              <Link href="/admin/orders" className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs px-3 py-1">
                <span className="relative flex w-2 h-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full w-2 h-2 bg-amber-400" />
                </span>
                {pendingCount} νέα παραγγελία{(pendingCount ?? 0) !== 1 ? 'ές' : ''}
              </Link>
            )}
            <Link href="/" className="text-xs text-[#2E2E2E]/40 hover:text-[#C8102E] transition-colors">
              → Κατάστημα
            </Link>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
