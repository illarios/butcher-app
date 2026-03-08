import Hero from '@/components/shop/home/Hero'
import CategoriesBar from '@/components/shop/home/CategoriesBar'
import FeaturedProducts from '@/components/shop/home/FeaturedProducts'
import BrandStory from '@/components/shop/home/BrandStory'
import SubscriptionTeaser from '@/components/shop/home/SubscriptionTeaser'
import LatestRecipes from '@/components/shop/home/LatestRecipes'

const localBusinessJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'MeatEstablishment',
  name: 'Κρεοπωλείο Μάρκος',
  description: 'Φρέσκο κρέας υψηλής ποιότητας με παράδοση στο σπίτι ή παραλαβή από το κατάστημα.',
  url: process.env.NEXT_PUBLIC_APP_URL ?? 'https://kreopoleiomakros.gr',
  telephone: '+30-210-123-4567',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Ιθάκης 12',
    addressLocality: 'Αθήνα',
    postalCode: '11741',
    addressCountry: 'GR',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 37.9715,
    longitude: 23.7267,
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '07:00',
      closes: '15:00',
    },
  ],
  servesCuisine: 'Κρέας',
  priceRange: '€€',
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <Hero />
      <CategoriesBar />
      <FeaturedProducts />
      <BrandStory />
      <SubscriptionTeaser />
      <LatestRecipes />
    </>
  )
}
