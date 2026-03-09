'use client'

import { useCartStore } from '@/lib/stores/cart'

interface RecipeProduct {
  id: string
  name: string
  price_per_kg: number
  images: string[] | null
  category?: { name: string; slug: string } | null
}

export default function AddAllButton({ products }: { products: RecipeProduct[] }) {
  const addItem = useCartStore((s) => s.addItem)

  const handleAddAll = () => {
    products.forEach((p) => {
      addItem({
        productId:       p.id,
        productName:     p.name,
        categoryName:    p.category?.name,
        weightGrams:     500,
        pricePerKg:      Number(p.price_per_kg),
        extraPricePerKg: 0,
        image:           p.images?.[0],
      })
    })
  }

  return (
    <button
      onClick={handleAddAll}
      className="hidden sm:inline-block bg-[#C8102E] text-white text-xs uppercase tracking-widest px-5 py-2.5 hover:bg-[#8B0000] transition-colors"
    >
      Αγορά όλων (500g/τεμ.)
    </button>
  )
}
