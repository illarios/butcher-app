import { redirect } from 'next/navigation'
import { getProfile } from '@/lib/queries/account'
import ProfileForm from './ProfileForm'

export default async function ProfilePage() {
  const profile = await getProfile()
  if (!profile) redirect('/login?next=/account/profile')

  return (
    <div>
      <div className="mb-6">
        <h1
          className="text-2xl font-bold text-[#2E2E2E]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Προφίλ
        </h1>
        <p className="text-sm text-[#2E2E2E]/50 mt-1">Διαχειριστείτε τα στοιχεία σας</p>
      </div>

      <ProfileForm profile={profile} />
    </div>
  )
}
