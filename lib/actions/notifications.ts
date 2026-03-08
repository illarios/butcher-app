'use server'

import { createClient } from '@/lib/supabase/server'

export async function markAsRead(notificationId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .eq('profile_id', user.id)
}

export async function markAllAsRead(): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('profile_id', user.id)
    .eq('is_read', false)
}
