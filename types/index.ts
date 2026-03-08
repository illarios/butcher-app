// ─── Category ──────────────────────────────────────────────────────────────────
export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image_url?: string
  display_order: number
  is_active: boolean
}

// ─── Cut ───────────────────────────────────────────────────────────────────────
export interface Cut {
  id: string
  product_id: string
  name: string
  description?: string
  extra_price_per_kg: number
}

// ─── Product ───────────────────────────────────────────────────────────────────
export interface Product {
  id: string
  category_id: string
  name: string
  slug: string
  description?: string
  origin?: string
  breed?: string
  aging_days?: number
  price_per_kg: number
  min_weight_grams: number   // default 200
  max_weight_grams: number   // default 5000
  step_grams: number         // default 100
  images: string[]
  is_active: boolean
  stock_grams?: number
  featured: boolean
  recipe_ids?: string[]
  product_type: 'cut' | 'preparation'
  created_at?: string
  // joined
  category?: Category
  cuts?: Cut[]
}

// ─── Recipe ────────────────────────────────────────────────────────────────────
export interface RecipeIngredient {
  name: string
  quantity: string
}

export interface RecipeStep {
  step: string
}

export type RecipeDifficulty   = 'easy' | 'medium' | 'hard'
export type RecipeMeatCategory = 'mosxari' | 'xoirino' | 'poulerika' | 'arni-katsiki' | 'mixed'

export interface Recipe {
  id: string
  title: string
  slug: string
  description?: string
  prep_time_minutes?: number
  cook_time_minutes?: number
  servings?: number
  ingredients: RecipeIngredient[]
  steps: RecipeStep[]
  image_url?: string
  product_ids?: string[]
  difficulty?: RecipeDifficulty
  meat_category?: RecipeMeatCategory
}

// ─── Cart ──────────────────────────────────────────────────────────────────────
export interface CartItem {
  product: Product
  weight_grams: number        // selected weight in grams
  cut?: Cut                   // selected cut (optional)
  notes?: string              // customer note to butcher
  price_eur: number           // computed: (weight_grams/1000) * (price_per_kg + cut.extra_price_per_kg)
}

// ─── Order ─────────────────────────────────────────────────────────────────────
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'

export type FulfillmentType = 'pickup' | 'delivery'
export type PaymentMethod   = 'cod' | 'cop'

export interface OrderItemSnapshot {
  product_id: string
  product_name: string
  cut_name?: string
  weight_grams: number
  price_per_kg: number
  extra_price_per_kg: number
  notes?: string
  line_total: number
}

export interface Order {
  id: string
  order_number: string
  profile_id: string
  status: OrderStatus
  fulfillment_type: FulfillmentType
  delivery_zone_id?: string
  delivery_address?: Address
  payment_method: PaymentMethod
  items: OrderItemSnapshot[]
  subtotal: number
  delivery_fee: number
  loyalty_discount: number
  total: number
  notes?: string
  estimated_ready_at?: string
  admin_note?: string
  confirmed_at?: string
  loyalty_points_earned: number
  loyalty_points_used: number
  created_at: string
}

// ─── Address ───────────────────────────────────────────────────────────────────
export interface Address {
  street: string
  number: string
  city: string
  postal_code: string
  floor?: string
  notes?: string
}

// ─── DeliveryZone ──────────────────────────────────────────────────────────────
export interface DeliveryZone {
  id: string
  name: string
  postal_codes: string[]
  is_active: boolean
  min_order_amount: number
  delivery_fee: number
  estimated_delivery_minutes: number
}

// ─── Profile ───────────────────────────────────────────────────────────────────
export interface Profile {
  id: string
  full_name?: string
  phone?: string
  birthday?: string
  address?: Address
  loyalty_points: number
  loyalty_tier: 'bronze' | 'silver' | 'gold'
  created_at: string
}

// ─── Loyalty ───────────────────────────────────────────────────────────────────
export interface LoyaltyTransaction {
  id: string
  profile_id: string
  order_id?: string
  points: number
  type: 'earn' | 'redeem'
  description?: string
  created_at: string
}

// ─── Catalog filters (URL-based) ───────────────────────────────────────────────
export interface CatalogFilters {
  category?: string        // slug
  minPrice?: number
  maxPrice?: number
  origin?: string
  sort?: 'featured' | 'price_asc' | 'price_desc' | 'newest'
  page?: number
}
