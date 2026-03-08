import { createAdminClient } from '@/lib/supabase/admin'

export type NotificationType =
  | 'order_received'
  | 'order_confirmed'
  | 'order_ready'
  | 'order_delivered'
  | 'loyalty_earned'
  | 'loyalty_tier_up'
  | 'welcome'

interface CreateNotificationInput {
  profileId: string
  type: NotificationType
  title: string
  body: string
  link?: string
}

export async function createNotification({
  profileId, type, title, body, link,
}: CreateNotificationInput): Promise<void> {
  const admin = createAdminClient()
  await admin.from('notifications').insert({
    profile_id: profileId,
    type,
    title,
    body,
    link: link ?? null,
  })
  // Non-blocking — errors are intentionally swallowed
}
