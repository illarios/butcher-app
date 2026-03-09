import type { OrderStatus, FulfillmentType } from '@/types'

export const STATUS_CONFIG: Record<OrderStatus, { label: string; description: string; icon: string }> = {
  pending:          { label: 'Ελήφθη',         description: 'Η παραγγελία σας ελήφθη',            icon: '📋' },
  confirmed:        { label: 'Επιβεβαιώθηκε',  description: 'Ο Μάρκος επιβεβαίωσε την παραγγελία', icon: '✓'  },
  preparing:        { label: 'Ετοιμάζεται',    description: 'Το κρέας σας ετοιμάζεται',            icon: '🔪' },
  ready:            { label: 'Έτοιμη',          description: 'Η παραγγελία σας είναι έτοιμη',       icon: '✦'  },
  out_for_delivery: { label: 'Σε διανομή',      description: 'Ο διανομέας είναι καθ\' οδόν',        icon: '🚚' },
  delivered:        { label: 'Παραδόθηκε',      description: 'Η παραγγελία σας παραδόθηκε',         icon: '🎉' },
  cancelled:        { label: 'Ακυρώθηκε',       description: 'Η παραγγελία ακυρώθηκε',              icon: '✕'  },
}

export const STATUS_ORDER: OrderStatus[] = [
  'pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered',
]

export function formatPrice(n: number) {
  return n.toFixed(2).replace('.', ',') + '€'
}

export function formatWeight(g: number) {
  return g >= 1000 ? `${(g / 1000).toFixed(2).replace('.', ',')} kg` : `${g} g`
}

export const FULFILLMENT_CONFIG: Record<FulfillmentType, { label: string; icon: string }> = {
  pickup:   { label: 'Παραλαβή', icon: '🏪' },
  delivery: { label: 'Διανομή',  icon: '🚚' },
}
