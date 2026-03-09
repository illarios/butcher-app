import Header from '@/components/shop/Header'
import Footer from '@/components/shop/Footer'
import NotificationBellWrapper from '@/components/shop/NotificationBellWrapper'
import WelcomeModal from '@/components/shop/WelcomeModal'
import BottomNav from '@/components/pwa/BottomNav'
import InstallPrompt from '@/components/pwa/InstallPrompt'
import SplashScreenWrapper from '@/components/pwa/SplashScreenWrapper'

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SplashScreenWrapper />
      <Header notificationSlot={<NotificationBellWrapper />} />
      {/* pb-16 on mobile to avoid content hidden behind BottomNav */}
      <main className="pb-16 md:pb-0">{children}</main>
      <Footer />
      <WelcomeModal />
      <BottomNav />
      <InstallPrompt />
    </>
  )
}
