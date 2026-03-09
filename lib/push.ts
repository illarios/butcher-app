import webpush from 'web-push'
import { createAdminClient } from '@/lib/supabase/admin'

// Configure VAPID once — safe to call multiple times (idempotent)
if (process.env.VAPID_EMAIL && process.env.VAPID_PRIVATE_KEY && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
  )
}

export interface PushPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  data?: { url: string }
}

export async function sendPushToUser(profileId: string, payload: PushPayload): Promise<void> {
  if (!process.env.VAPID_PRIVATE_KEY) return

  const admin = createAdminClient()
  const { data: subscriptions } = await admin
    .from('push_subscriptions')
    .select('id, subscription')
    .eq('profile_id', profileId)

  if (!subscriptions?.length) return

  const staleIds: string[] = []

  await Promise.allSettled(
    subscriptions.map(async ({ id, subscription }) => {
      try {
        await webpush.sendNotification(
          subscription as webpush.PushSubscription,
          JSON.stringify({
            title: payload.title,
            body: payload.body,
            icon: payload.icon ?? '/icons/icon-192x192.png',
            badge: payload.badge ?? '/icons/badge-72x72.png',
            data: payload.data ?? { url: '/' },
          }),
        )
      } catch (err: unknown) {
        const status = (err as { statusCode?: number }).statusCode
        if (status === 410 || status === 404) {
          staleIds.push(id)
        }
      }
    }),
  )

  // Clean up expired subscriptions
  if (staleIds.length > 0) {
    await admin.from('push_subscriptions').delete().in('id', staleIds)
  }
}
