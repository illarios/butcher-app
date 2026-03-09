import { Suspense } from 'react'
import Link from 'next/link'
import { getRecipes } from '@/lib/queries/recipes'
import type { Metadata } from 'next'
import type { RecipeDifficulty, RecipeMeatCategory, Recipe } from '@/types'
import { RECIPE_IMAGES } from '@/lib/recipeImages'

export const metadata: Metadata = {
  title: 'Συνταγές — Κρεοπωλείο Μάρκος',
  description: 'Μαγειρέψτε με τα καλύτερα κρέατα. Συνταγές για μοσχάρι, χοιρινό, κοτόπουλο και αρνί από το Κρεοπωλείο Μάρκος.',
}

// ── Labels ────────────────────────────────────────────────────────────────────
const CATEGORY_LABELS: Record<RecipeMeatCategory | 'all', string> = {
  all:            'Όλες',
  mosxari:        'Μοσχάρι',
  xoirino:        'Χοιρινό',
  poulerika:      'Πουλερικά',
  'arni-katsiki': 'Αρνί & Κατσίκι',
  mixed:          'Μικτές',
}

const DIFFICULTY_LABELS: Record<RecipeDifficulty | 'all', string> = {
  all:    'Όλα',
  easy:   'Εύκολο',
  medium: 'Μέτριο',
  hard:   'Δύσκολο',
}

const TIME_OPTIONS = [
  { value: '', label: 'Όλοι' },
  { value: '30',  label: '≤ 30 λεπτά' },
  { value: '60',  label: '≤ 1 ώρα' },
  { value: '120', label: '≤ 2 ώρες' },
]

// ── Filter bar (client would be ideal, but URL-based works as Server Component) ─
interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

// ── Recipe card ───────────────────────────────────────────────────────────────
function RecipeCard({ recipe, featured = false }: { recipe: Recipe; featured?: boolean }) {
  const total = (recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0)
  const diffLabel = DIFFICULTY_LABELS[recipe.difficulty ?? 'medium']
  const catLabel  = recipe.meat_category ? CATEGORY_LABELS[recipe.meat_category] : null

  return (
    <Link
      href={`/recipes/${recipe.slug}`}
      className={`group flex flex-col bg-white border border-[#EDE0D0] hover:border-[#C8102E] transition-colors overflow-hidden ${
        featured ? 'sm:col-span-2 sm:flex-row' : ''
      }`}
    >
      {/* Image */}
      <div className={`bg-[#EDE0D0] relative overflow-hidden shrink-0 ${
        featured ? 'sm:w-1/2 aspect-[4/3] sm:aspect-auto' : 'aspect-[16/9]'
      }`}>
        {(RECIPE_IMAGES[recipe.slug] ?? recipe.image_url) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={RECIPE_IMAGES[recipe.slug] ?? recipe.image_url!}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-20">🍳</div>
        )}
        {catLabel && (
          <span className="absolute top-3 left-3 bg-[#C8102E] text-white text-[9px] uppercase tracking-widest px-2 py-1">
            {catLabel}
          </span>
        )}
      </div>

      {/* Content */}
      <div className={`p-5 flex flex-col flex-1 ${featured ? 'sm:p-8 sm:justify-center' : ''}`}>
        <h2
          className={`font-bold text-[#2E2E2E] leading-snug mb-2 group-hover:text-[#C8102E] transition-colors ${
            featured ? 'text-xl sm:text-2xl' : 'text-base'
          }`}
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {recipe.title}
        </h2>
        {recipe.description && (
          <p className="text-sm text-[#2E2E2E]/60 leading-relaxed mb-4 line-clamp-2 flex-1">
            {recipe.description}
          </p>
        )}

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] uppercase tracking-widest text-[#2E2E2E]/40">
          {recipe.prep_time_minutes && <span>Προετ. {recipe.prep_time_minutes}'</span>}
          {recipe.cook_time_minutes && <span>Μαγ. {recipe.cook_time_minutes}'</span>}
          {total > 0 && <span className="text-[#2E2E2E]/60 font-semibold">Σύνολο {total}'</span>}
          {recipe.servings && <span>{recipe.servings} μερίδες</span>}
          <span className={`px-1.5 py-0.5 ${
            recipe.difficulty === 'easy'   ? 'text-green-700 bg-green-50' :
            recipe.difficulty === 'hard'   ? 'text-red-700 bg-red-50' :
                                             'text-amber-700 bg-amber-50'
          }`}>
            {diffLabel}
          </span>
        </div>
      </div>
    </Link>
  )
}

// ── Filter link helper ────────────────────────────────────────────────────────
function FilterLink({
  href, active, children,
}: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`px-3 py-1.5 text-xs uppercase tracking-widest border transition-colors whitespace-nowrap ${
        active
          ? 'bg-[#C8102E] text-white border-[#C8102E]'
          : 'border-[#EDE0D0] text-[#2E2E2E] hover:border-[#C8102E] hover:text-[#C8102E] bg-white'
      }`}
    >
      {children}
    </Link>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function RecipesPage({ searchParams }: PageProps) {
  const sp  = await searchParams
  const str = (k: string) => (Array.isArray(sp[k]) ? sp[k][0] : sp[k]) ?? undefined

  const meatCategory = str('category') as RecipeMeatCategory | undefined
  const difficulty   = str('difficulty') as RecipeDifficulty | undefined
  const maxTime      = str('time') ? Number(str('time')) : undefined

  const recipes = await getRecipes({ meatCategory, difficulty, maxTotalTime: maxTime })

  // Build base URL helper (preserves other filters, replaces one key)
  function filterUrl(key: string, value: string) {
    const p = new URLSearchParams()
    if (key !== 'category'   && meatCategory) p.set('category', meatCategory)
    if (key !== 'difficulty' && difficulty)   p.set('difficulty', difficulty)
    if (key !== 'time'       && maxTime)      p.set('time', String(maxTime))
    if (value) p.set(key, value)
    const qs = p.toString()
    return `/recipes${qs ? `?${qs}` : ''}`
  }

  const [featured, ...rest] = recipes

  return (
    <div className="min-h-screen bg-[#F5EFE6]">
      {/* Page header */}
      <div className="bg-white border-b border-[#EDE0D0] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.3em] text-[#C8102E] mb-1">Από την κουζίνα μας</p>
          <h1 className="text-3xl font-bold text-[#2E2E2E]" style={{ fontFamily: 'var(--font-display)' }}>
            Συνταγές
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Filter bar ────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 overflow-x-auto pb-1">
          {/* Category */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] uppercase tracking-widest text-[#2E2E2E]/40 shrink-0">Κατηγορία:</span>
            {(Object.keys(CATEGORY_LABELS) as (RecipeMeatCategory | 'all')[]).map((key) => (
              <FilterLink
                key={key}
                href={filterUrl('category', key === 'all' ? '' : key)}
                active={key === 'all' ? !meatCategory : meatCategory === key}
              >
                {CATEGORY_LABELS[key]}
              </FilterLink>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-10 overflow-x-auto pb-1">
          {/* Difficulty */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] uppercase tracking-widest text-[#2E2E2E]/40 shrink-0">Δυσκολία:</span>
            {(Object.keys(DIFFICULTY_LABELS) as (RecipeDifficulty | 'all')[]).map((key) => (
              <FilterLink
                key={key}
                href={filterUrl('difficulty', key === 'all' ? '' : key)}
                active={key === 'all' ? !difficulty : difficulty === key}
              >
                {DIFFICULTY_LABELS[key]}
              </FilterLink>
            ))}
          </div>

          {/* Time */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] uppercase tracking-widest text-[#2E2E2E]/40 shrink-0">Χρόνος:</span>
            {TIME_OPTIONS.map((opt) => (
              <FilterLink
                key={opt.value}
                href={filterUrl('time', opt.value)}
                active={opt.value === '' ? !maxTime : maxTime === Number(opt.value)}
              >
                {opt.label}
              </FilterLink>
            ))}
          </div>
        </div>

        {/* ── Results count ─────────────────────────────────────────── */}
        <p className="text-sm text-[#2E2E2E]/60 mb-6">
          <span className="font-semibold text-[#2E2E2E]">{recipes.length}</span> συνταγές
        </p>

        {/* ── Grid ──────────────────────────────────────────────────── */}
        {recipes.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-[#2E2E2E]/40 text-sm">Δεν βρέθηκαν συνταγές με αυτά τα φίλτρα.</p>
            <Link href="/recipes" className="text-xs text-[#C8102E] hover:underline mt-3 inline-block">
              Καθαρισμός φίλτρων
            </Link>
          </div>
        ) : (
          <Suspense>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* First card is featured (spans 2 cols) */}
              {featured && <RecipeCard recipe={featured} featured={rest.length > 0} />}
              {rest.map((r) => (
                <RecipeCard key={r.id} recipe={r} />
              ))}
            </div>
          </Suspense>
        )}
      </div>
    </div>
  )
}
