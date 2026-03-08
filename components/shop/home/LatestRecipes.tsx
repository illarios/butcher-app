import Link from 'next/link'

const RECIPES = [
  {
    slug: 'mosxari-kiloto-fourno',
    title: 'Μοσχαρίσιο Κιλότο στον Φούρνο',
    description: 'Παραδοσιακό μοσχαρίσιο κιλότο ψητό με δεντρολίβανο και σκόρδο.',
    prepTime: 20,
    cookTime: 120,
    tag: 'Μοσχάρι',
  },
  {
    slug: 'xoirino-kotsi-bira-sintagi',
    title: 'Χοιρινό Κότσι με Μπύρα',
    description: 'Μαριναρισμένο κότσι με μπύρα, μέλι και μουστάρδα — τραγανή επιφάνεια, μαλακό εσωτερικό.',
    prepTime: 15,
    cookTime: 150,
    tag: 'Χοιρινό',
  },
  {
    slug: 'kotopoulo-riganato',
    title: 'Κοτόπουλο Ριγανάτο',
    description: 'Το κλασικό ελληνικό κοτόπουλο με ρίγανη, λεμόνι και ελαιόλαδο.',
    prepTime: 15,
    cookTime: 45,
    tag: 'Πουλερικά',
  },
]

function RecipeCard({ recipe }: { recipe: typeof RECIPES[0] }) {
  const totalTime = recipe.prepTime + recipe.cookTime

  return (
    <Link
      href={`/recipes/${recipe.slug}`}
      className="group flex flex-col bg-white border border-[#EDE0D0] hover:border-[#C8102E] transition-colors overflow-hidden"
    >
      {/* Image placeholder */}
      <div className="aspect-[16/9] bg-[#EDE0D0] relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-20">
          🍳
        </div>
        <div className="absolute inset-0 bg-[#C8102E]/0 group-hover:bg-[#C8102E]/5 transition-colors" />

        {/* Tag */}
        <span className="absolute top-3 left-3 bg-[#C8102E] text-white text-[10px] uppercase tracking-widest px-2 py-1">
          {recipe.tag}
        </span>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <h3
          className="text-base font-bold text-[#2E2E2E] leading-snug mb-2 group-hover:text-[#C8102E] transition-colors"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {recipe.title}
        </h3>
        <p className="text-sm text-[#2E2E2E]/60 leading-relaxed mb-4 flex-1">
          {recipe.description}
        </p>
        <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest text-[#2E2E2E]/40">
          <span>Προετοιμασία {recipe.prepTime}'</span>
          <span>·</span>
          <span>Μαγείρεμα {recipe.cookTime}'</span>
          <span>·</span>
          <span>Σύνολο {totalTime}'</span>
        </div>
      </div>
    </Link>
  )
}

export default function LatestRecipes() {
  return (
    <section className="bg-[#F5EFE6] py-20 border-t border-[#EDE0D0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#C8102E] mb-2">
              Από την κουζίνα μας
            </p>
            <h2
              className="text-3xl font-bold text-[#2E2E2E]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Συνταγές
            </h2>
          </div>
          <Link
            href="/recipes"
            className="hidden sm:inline-block text-xs uppercase tracking-widest text-[#C8102E] hover:underline"
          >
            Όλες οι συνταγές →
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {RECIPES.map((recipe) => (
            <RecipeCard key={recipe.slug} recipe={recipe} />
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/recipes"
            className="inline-block border border-[#C8102E] text-[#C8102E] text-xs uppercase tracking-widest px-8 py-3"
          >
            Όλες οι συνταγές
          </Link>
        </div>
      </div>
    </section>
  )
}
