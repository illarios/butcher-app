import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ─── Cart item (store-native, no Product object — keeps serialisation simple) ──
export interface CartStoreItem {
  /** Stable key: productId + cutId (or 'none') */
  key: string
  productId: string
  productName: string
  categoryName?: string
  cutId?: string
  cutName?: string
  weightGrams: number
  pricePerKg: number          // base price
  extraPricePerKg: number     // cut surcharge
  notes?: string
  image?: string
}

function itemTotal(item: CartStoreItem): number {
  return (item.weightGrams / 1000) * (item.pricePerKg + item.extraPricePerKg)
}

// ─── Store ─────────────────────────────────────────────────────────────────────
interface CartState {
  items: CartStoreItem[]
  // actions
  addItem: (item: Omit<CartStoreItem, 'key'>) => void
  removeItem: (key: string) => void
  updateNotes: (key: string, notes: string) => void
  updateWeight: (key: string, weightGrams: number) => void
  clearCart: () => void
  // computed (derived but exposed as functions for easy use)
  itemCount: () => number
  subtotal: () => number
  loyaltyPointsEstimate: () => number   // 1 point per €1
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (raw) => {
        const key = `${raw.productId}__${raw.cutId ?? 'none'}`
        set((state) => {
          const existing = state.items.find((i) => i.key === key)
          if (existing) {
            // Accumulate weight if same product + cut
            return {
              items: state.items.map((i) =>
                i.key === key
                  ? { ...i, weightGrams: i.weightGrams + raw.weightGrams }
                  : i
              ),
            }
          }
          return { items: [...state.items, { ...raw, key }] }
        })
      },

      removeItem: (key) =>
        set((state) => ({ items: state.items.filter((i) => i.key !== key) })),

      updateNotes: (key, notes) =>
        set((state) => ({
          items: state.items.map((i) => (i.key === key ? { ...i, notes } : i)),
        })),

      updateWeight: (key, weightGrams) =>
        set((state) => ({
          items: state.items.map((i) => (i.key === key ? { ...i, weightGrams } : i)),
        })),

      clearCart: () => set({ items: [] }),

      itemCount: () => get().items.length,

      subtotal: () => get().items.reduce((sum, i) => sum + itemTotal(i), 0),

      loyaltyPointsEstimate: () => Math.floor(get().items.reduce((sum, i) => sum + itemTotal(i), 0)),
    }),
    { name: 'mkr-cart' }
  )
)

// Helper exposed for components
export { itemTotal }
