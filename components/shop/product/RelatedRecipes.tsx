import Link from 'next/link'
import type { Recipe } from '@/types'

interface Props {
  recipes: Recipe[]
}

export default function RelatedRecipes({ recipes }: Props) {
  if (recipes.length === 0) return null

  return (
    <section className="mt-16 pt-12 border-t border-[#EDE0D0]">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[#C8102E] mb-1">
            Μαγειρέψτε το
          </p>
          <h2
            className="text-2xl font-bold text-[#2E2E2E]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Συνταγές με αυτό το προϊόν
          </h2>
        </div>
        <Link
          href="/recipes"
          className="hidden sm:inline-block text-xs uppercase tracking-widest text-[#C8102E] hover:underline"
        >
          Όλες →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => {
          const totalTime = (recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0)
          return (
            <Link
              key={recipe.id}
              href={`/recipes/${recipe.slug}`}
              className="group flex flex-col bg-white border border-[#EDE0D0] hover:border-[#C8102E] transition-colors overflow-hidden"
            >
              {/* Image */}
              <div className="aspect-[16/9] bg-[#EDE0D0] relative overflow-hidden">
                {recipe.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={recipe.image_url}
                    alt={recipe.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-20">
                    🍳
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <h3
                  className="text-sm font-bold text-[#2E2E2E] leading-snug mb-2 group-hover:text-[#C8102E] transition-colors"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {recipe.title}
                </h3>
                {recipe.description && (
                  <p className="text-xs text-[#2E2E2E]/60 leading-relaxed mb-3 line-clamp-2">
                    {recipe.description}
                  </p>
                )}
                <div className="flex gap-3 text-[10px] uppercase tracking-widest text-[#2E2E2E]/40">
                  {recipe.prep_time_minutes && <span>Προετ. {recipe.prep_time_minutes}'</span>}
                  {recipe.cook_time_minutes && <span>Μαγ. {recipe.cook_time_minutes}'</span>}
                  {totalTime > 0 && <span>Σύνολο {totalTime}'</span>}
                  {recipe.servings && <span>{recipe.servings} μερίδες</span>}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
