import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getRecipeBySlug, getProductsForRecipe } from '@/lib/queries/recipes'
import type { RecipeDifficulty } from '@/types'
import AddAllButton from '@/components/shop/recipe/AddAllButton'

interface PageProps {
  params: Promise<{ slug: string }>
}

// ── SEO ───────────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const recipe = await getRecipeBySlug(slug)
  if (!recipe) return {}
  const total = (recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0)
  return {
    title: `${recipe.title} — Συνταγές Κρεοπωλείου Μάρκος`,
    description: recipe.description ?? `${recipe.title} — Συνταγή από το Κρεοπωλείο Μάρκος.`,
    openGraph: {
      title:       recipe.title,
      description: recipe.description,
      images:      recipe.image_url ? [{ url: recipe.image_url }] : [],
      type:        'article',
    },
    other: {
      'recipe:prep_time':   String(recipe.prep_time_minutes ?? 0),
      'recipe:cook_time':   String(recipe.cook_time_minutes ?? 0),
      'recipe:total_time':  String(total),
    },
  }
}

// ── JSON-LD builder ───────────────────────────────────────────────────────────
function buildJsonLd(recipe: NonNullable<Awaited<ReturnType<typeof getRecipeBySlug>>>) {
  const total = (recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0)
  const toISO = (min: number) => `PT${min}M`

  return {
    '@context':      'https://schema.org',
    '@type':         'Recipe',
    name:            recipe.title,
    description:     recipe.description ?? '',
    image:           recipe.image_url ? [recipe.image_url] : [],
    author:          { '@type': 'Organization', name: 'Κρεοπωλείο Μάρκος' },
    datePublished:   '2025-01-01',
    prepTime:        toISO(recipe.prep_time_minutes ?? 0),
    cookTime:        toISO(recipe.cook_time_minutes ?? 0),
    totalTime:       toISO(total),
    recipeYield:     recipe.servings ? `${recipe.servings} μερίδες` : undefined,
    recipeCategory:  'Κυρίως πιάτο',
    recipeCuisine:   'Ελληνική',
    recipeIngredient: (recipe.ingredients ?? []).map((i) => `${i.quantity} ${i.name}`),
    recipeInstructions: (recipe.steps ?? []).map((s, idx) => ({
      '@type':  'HowToStep',
      position: idx + 1,
      text:     s.step,
    })),
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const DIFFICULTY_LABELS: Record<RecipeDifficulty, string> = {
  easy:   'Εύκολο',
  medium: 'Μέτριο',
  hard:   'Δύσκολο',
}

function MetaPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center px-5 py-3 border-r border-[#EDE0D0] last:border-r-0">
      <span className="text-[10px] uppercase tracking-widest text-[#2E2E2E]/40 mb-0.5">{label}</span>
      <span className="text-sm font-semibold text-[#2E2E2E]">{value}</span>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function RecipeDetailPage({ params }: PageProps) {
  const { slug } = await params
  const recipe = await getRecipeBySlug(slug)
  if (!recipe) notFound()

  const relatedProducts = await getProductsForRecipe(recipe.product_ids ?? [])

  const total = (recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0)
  const jsonLd = buildJsonLd(recipe)

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-[#F5EFE6]">

        {/* ── Hero ────────────────────────────────────────────────── */}
        <div className="relative bg-[#0D0D0D] overflow-hidden" style={{ minHeight: '45vh' }}>
          {recipe.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={recipe.image_url}
              alt={recipe.title}
              className="absolute inset-0 w-full h-full object-cover opacity-40"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-9xl opacity-10">🍳</div>
          )}
          <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
            <Link
              href="/recipes"
              className="inline-block text-[#F5EFE6]/60 hover:text-[#F5EFE6] text-xs uppercase tracking-widest mb-6 transition-colors"
            >
              ← Συνταγές
            </Link>
            {recipe.meat_category && (
              <p className="text-xs uppercase tracking-[0.3em] text-[#C8102E] mb-3">
                {recipe.meat_category === 'mosxari'        ? 'Μοσχάρι' :
                 recipe.meat_category === 'xoirino'        ? 'Χοιρινό' :
                 recipe.meat_category === 'poulerika'      ? 'Πουλερικά' :
                 recipe.meat_category === 'arni-katsiki'   ? 'Αρνί & Κατσίκι' : 'Μικτό'}
              </p>
            )}
            <h1
              className="text-4xl sm:text-5xl font-bold text-[#F5EFE6] leading-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {recipe.title}
            </h1>
            {recipe.description && (
              <p className="mt-4 text-[#F5EFE6]/70 text-base leading-relaxed max-w-xl">
                {recipe.description}
              </p>
            )}
          </div>
        </div>

        {/* ── Meta bar ────────────────────────────────────────────── */}
        <div className="bg-white border-b border-[#EDE0D0]">
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-wrap divide-x divide-[#EDE0D0]">
              {recipe.prep_time_minutes != null && (
                <MetaPill label="Προετοιμασία" value={`${recipe.prep_time_minutes}'`} />
              )}
              {recipe.cook_time_minutes != null && (
                <MetaPill label="Μαγείρεμα" value={`${recipe.cook_time_minutes}'`} />
              )}
              {total > 0 && (
                <MetaPill label="Σύνολο" value={`${total}'`} />
              )}
              {recipe.servings != null && (
                <MetaPill label="Μερίδες" value={String(recipe.servings)} />
              )}
              {recipe.difficulty && (
                <MetaPill
                  label="Δυσκολία"
                  value={DIFFICULTY_LABELS[recipe.difficulty]}
                />
              )}
            </div>
          </div>
        </div>

        {/* ── Body ────────────────────────────────────────────────── */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10">

            {/* ── Ingredients ───────────────────────────────────── */}
            <aside className="md:col-span-2">
              <div className="bg-white border border-[#EDE0D0] p-6 sticky top-20">
                <h2
                  className="text-base font-bold text-[#2E2E2E] mb-4"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Υλικά
                  {recipe.servings && (
                    <span className="text-xs font-normal text-[#2E2E2E]/40 ml-2">
                      ({recipe.servings} μερίδες)
                    </span>
                  )}
                </h2>
                <ul className="space-y-3">
                  {(recipe.ingredients ?? []).map((ing, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C8102E] shrink-0 mt-1.5" aria-hidden="true" />
                      <span className="text-[#2E2E2E]">
                        <strong>{ing.quantity}</strong>{' '}
                        <span className="text-[#2E2E2E]/70">{ing.name}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            {/* ── Steps ─────────────────────────────────────────── */}
            <div className="md:col-span-3">
              <h2
                className="text-xl font-bold text-[#2E2E2E] mb-6"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Εκτέλεση
              </h2>
              <ol className="space-y-6">
                {(recipe.steps ?? []).map((s, i) => (
                  <li key={i} className="flex gap-4">
                    <span
                      className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-[#C8102E] text-white text-sm font-bold"
                      aria-hidden="true"
                    >
                      {i + 1}
                    </span>
                    <p className="text-[#2E2E2E]/80 text-sm leading-relaxed pt-1">{s.step}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* ── Required products ─────────────────────────────────── */}
          {relatedProducts.length > 0 && (
            <section className="mt-16 pt-12 border-t border-[#EDE0D0]">
              <div className="flex items-end justify-between mb-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-[#C8102E] mb-1">
                    Από το κρεοπωλείο
                  </p>
                  <h2
                    className="text-2xl font-bold text-[#2E2E2E]"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    Προϊόντα που χρειάζεστε
                  </h2>
                </div>

                {/* Αγορά όλων — adds all to cart */}
                <AddAllButton products={relatedProducts} />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {relatedProducts.map((p: RecipeProduct) => (
                  <Link
                    key={p.id}
                    href={`/products/${p.slug}`}
                    className="group flex flex-col bg-white border border-[#EDE0D0] hover:border-[#C8102E] transition-colors overflow-hidden"
                  >
                    <div className="aspect-square bg-[#EDE0D0] relative overflow-hidden">
                      {p.images?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-20">🥩</div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-[#C8102E] mb-0.5">{p.category?.name}</p>
                      <p className="text-sm font-semibold text-[#2E2E2E] leading-snug group-hover:text-[#C8102E] transition-colors" style={{ fontFamily: 'var(--font-display)' }}>
                        {p.name}
                      </p>
                      <p className="text-sm font-bold text-[#2E2E2E] mt-1">
                        {Number(p.price_per_kg).toFixed(2).replace('.', ',')}€
                        <span className="text-xs font-normal text-[#2E2E2E]/50 ml-1">/ κιλό</span>
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  )
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface RecipeProduct {
  id: string
  name: string
  slug: string
  price_per_kg: number
  images: string[] | null
  category?: { name: string; slug: string } | null
}
