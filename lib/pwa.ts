'use client'

// ── Install prompt ─────────────────────────────────────────────────────────────

let deferredPrompt: BeforeInstallPromptEvent | null = null

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
  prompt(): Promise<void>
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e as BeforeInstallPromptEvent
  })
}

export function useInstallPrompt() {
  return {
    canInstall: () => deferredPrompt !== null,
    prompt: async () => {
      if (!deferredPrompt) return false
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      deferredPrompt = null
      return outcome === 'accepted'
    },
  }
}

// ── Standalone detection ───────────────────────────────────────────────────────

export function isInstalled(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

// ── iOS detection ──────────────────────────────────────────────────────────────

export function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

export function isIOSSafari(): boolean {
  if (typeof navigator === 'undefined') return false
  return isIOS() && /safari/i.test(navigator.userAgent) && !/crios|fxios/i.test(navigator.userAgent)
}

// ── Prompt suppression ────────────────────────────────────────────────────────

const STORAGE_KEY = 'mkr-install-dismissed'
const SUPPRESS_DAYS = 7

export function shouldShowPrompt(): boolean {
  if (typeof window === 'undefined') return false
  if (isInstalled()) return false

  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw) {
    const dismissedAt = Number(raw)
    const daysSince = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24)
    if (daysSince < SUPPRESS_DAYS) return false
  }

  const visits = Number(localStorage.getItem('mkr-visit-count') ?? 0)
  return visits >= 3
}

export function dismissPrompt() {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, String(Date.now()))
}

export function recordVisit() {
  if (typeof window === 'undefined') return
  const visits = Number(localStorage.getItem('mkr-visit-count') ?? 0)
  localStorage.setItem('mkr-visit-count', String(visits + 1))
}

// ── Push notification suppression ─────────────────────────────────────────────

const PUSH_DISMISS_KEY = 'mkr-push-dismissed'
const PUSH_SUPPRESS_DAYS = 30

export function shouldShowPushBanner(): boolean {
  if (typeof window === 'undefined') return false
  if (typeof Notification === 'undefined') return false
  if (Notification.permission !== 'default') return false

  const raw = localStorage.getItem(PUSH_DISMISS_KEY)
  if (raw) {
    const dismissedAt = Number(raw)
    const daysSince = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24)
    if (daysSince < PUSH_SUPPRESS_DAYS) return false
  }

  return true
}

export function dismissPushBanner() {
  if (typeof window === 'undefined') return
  localStorage.setItem(PUSH_DISMISS_KEY, String(Date.now()))
}

// ── Push subscription ──────────────────────────────────────────────────────────

export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (typeof window === 'undefined') return null
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null

  const registration = await navigator.serviceWorker.ready
  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  if (!vapidKey) return null

  const existing = await registration.pushManager.getSubscription()
  if (existing) return existing

  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidKey),
  })
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)))
}
