import { createClient } from '@/lib/supabase/server'
import NotificationBell from './NotificationBell'

export default async function NotificationBellWrapper() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: notifications } = await supabase
    .from('notifications')
    .select('id, type, title, body, link, is_read, created_at')
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false })
    .limit(30)

  return (
    <NotificationBell
      profileId={user.id}
      initialNotifications={notifications ?? []}
    />
  )
}
