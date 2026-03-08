import { redirect } from 'next/navigation'

// /account → redirect to orders
export default function AccountPage() {
  redirect('/account/orders')
}
