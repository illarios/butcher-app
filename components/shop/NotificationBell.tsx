'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { markAsRead, markAllAsRead } from '@/lib/actions/notifications'

interface Notification {
  id: string
  type: string
  title: string
  body: string
  link: string | null
  is_read: boolean
  created_at: string
}

const TYPE_ICON: Record<string, string> = {
  order_received:  '🥩',
  order_confirmed: '✅',
  order_ready:     '🔔',
  order_delivered: '🎉',
  loyalty_earned:  '⭐',
  loyalty_tier_up: '🏆',
  welcome:         '👋',
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'μόλις τώρα'
  if (mins < 60) return `${mins} λεπτά πριν`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} ώρ${hrs === 1 ? 'α' : 'ες'} πριν`
  const days = Math.floor(hrs / 24)
  return `${days} ημέρ${days === 1 ? 'α' : 'ες'} πριν`
}

interface Props {
  profileId: string
  initialNotifications: Notification[]
}

export default function NotificationBell({ profileId, initialNotifications }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const [open, setOpen]     = useState(false)
  const [toast, setToast]   = useState<Notification | null>(null)
  const dropdownRef         = useRef<HTMLDivElement>(null)
  const router              = useRouter()
  const [, startTransition] = useTransition()

  const unread = notifications.filter((n) => !n.is_read).length

  // Close on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`notifications-${profileId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `profile_id=eq.${profileId}` },
        (payload) => {
          const notif = payload.new as Notification
          setNotifications((prev) => [notif, ...prev])
          // Show toast for 4 seconds
          setToast(notif)
          setTimeout(() => setToast((t) => t?.id === notif.id ? null : t), 4000)
        },
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [profileId])

  const handleClick = async (notif: Notification) => {
    setOpen(false)
    if (!notif.is_read) {
      setNotifications((prev) =>
        prev.map((n) => n.id === notif.id ? { ...n, is_read: true } : n)
      )
      startTransition(() => { markAsRead(notif.id) })
    }
    if (notif.link) router.push(notif.link)
  }

  const handleMarkAll = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    startTransition(() => { markAllAsRead() })
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex items-center justify-center w-9 h-9 text-[#2E2E2E] hover:text-[#C8102E] transition-colors"
        aria-label="Ειδοποιήσεις"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-4 px-0.5 bg-[#C8102E] text-white text-[10px] font-bold rounded-full">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-[#EDE0D0] shadow-lg z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#EDE0D0]">
            <span className="text-xs font-bold uppercase tracking-widest text-[#2E2E2E]">Ειδοποιήσεις</span>
            {unread > 0 && (
              <button
                onClick={handleMarkAll}
                className="text-[10px] text-[#C8102E] hover:underline uppercase tracking-wider"
              >
                Σήμανση όλων ως αναγνωσμένα
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-[#EDE0D0]">
            {notifications.length === 0 ? (
              <p className="text-sm text-[#2E2E2E]/40 text-center py-8">Δεν υπάρχουν ειδοποιήσεις ακόμα</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`w-full text-left px-4 py-3 flex gap-3 transition-colors hover:bg-[#F5EFE6]/60
                    ${n.is_read ? 'bg-white' : 'bg-[#FFF8F5] border-l-2 border-[#C8102E]'}`}
                >
                  <span className="text-lg shrink-0 mt-0.5">{TYPE_ICON[n.type] ?? '📬'}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#2E2E2E] leading-tight">{n.title}</p>
                    {n.body && <p className="text-xs text-[#2E2E2E]/60 mt-0.5 leading-snug">{n.body}</p>}
                    <p className="text-[10px] text-[#2E2E2E]/30 mt-1">{relativeTime(n.created_at)}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] max-w-xs bg-white border border-[#EDE0D0] shadow-lg px-4 py-3 flex gap-3 animate-in slide-in-from-bottom-4">
          <span className="text-lg shrink-0">{TYPE_ICON[toast.type] ?? '📬'}</span>
          <div>
            <p className="text-xs font-bold text-[#2E2E2E]">{toast.title}</p>
            {toast.body && <p className="text-xs text-[#2E2E2E]/60 mt-0.5">{toast.body}</p>}
          </div>
          <button
            onClick={() => setToast(null)}
            className="ml-auto text-[#2E2E2E]/30 hover:text-[#2E2E2E] text-sm self-start"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
