import { createClient } from '@/lib/supabase/server'
import type { Recipe, RecipeDifficulty, RecipeMeatCategory } from '@/types'

export interface RecipeFilters {
  meatCategory?: RecipeMeatCategory
  difficulty?:   RecipeDifficulty
  maxTotalTime?: number   // prep + cook minutes
}

export async function getRecipes(filters: RecipeFilters = {}): Promise<Recipe[]> {
  const supabase = await createClient()

  let query = supabase
    .from('recipes')
    .select('*')
    .order('title')

  if (filters.meatCategory) {
    query = query.eq('meat_category', filters.meatCategory)
  }
  if (filters.difficulty) {
    query = query.eq('difficulty', filters.difficulty)
  }

  const { data } = await query
  let recipes = (data as Recipe[]) ?? []

  // Filter by total time client-side (no stored column)
  if (filters.maxTotalTime) {
    recipes = recipes.filter(
      (r) => ((r.prep_time_minutes ?? 0) + (r.cook_time_minutes ?? 0)) <= filters.maxTotalTime!
    )
  }

  return recipes
}

export async function getRecipeBySlug(slug: string): Promise<Recipe | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('recipes')
    .select('*')
    .eq('slug', slug)
    .single()
  return (data as Recipe) ?? null
}

export async function getProductsForRecipe(productIds: string[]) {
  if (!productIds.length) return []
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('id, name, slug, price_per_kg, images, category:categories(name, slug)')
    .in('id', productIds)
    .eq('is_active', true)
  return data ?? []
}
