import Header from '@/components/shop/Header'
import Footer from '@/components/shop/Footer'
import NotificationBellWrapper from '@/components/shop/NotificationBellWrapper'
import WelcomeModal from '@/components/shop/WelcomeModal'

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header notificationSlot={<NotificationBellWrapper />} />
      <main>{children}</main>
      <Footer />
      <WelcomeModal />
    </>
  )
}
