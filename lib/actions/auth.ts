'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createNotification } from '@/lib/notifications'

export async function loginAction(_prevState: unknown, formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: 'Λάθος email ή κωδικός πρόσβασης.' }
  }

  revalidatePath('/', 'layout')

  // Honour ?next= redirect from middleware
  const headersList = await headers()
  const referer = headersList.get('referer') ?? ''
  const nextParam = new URL(referer, 'http://localhost').searchParams.get('next')
  redirect(nextParam ?? '/account')
}

export async function registerAction(_prevState: unknown, formData: FormData): Promise<{ error?: string; success?: string }> {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const full_name = formData.get('full_name') as string
  const phone = formData.get('phone') as string

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name, phone },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/account`,
    },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: 'Υπάρχει ήδη λογαριασμός με αυτό το email.' }
    }
    return { error: 'Παρουσιάστηκε σφάλμα. Παρακαλώ δοκιμάστε ξανά.' }
  }

  // Get the new user's profile_id to create welcome notification
  // The profile is created via Supabase trigger on auth.users insert
  // We need the user id — fetch it via admin client
  const admin = createAdminClient()
  const { data: authUsers } = await admin.auth.admin.listUsers()
  const newUser = authUsers?.users?.find((u) => u.email === email)
  if (newUser) {
    createNotification({
      profileId: newUser.id,
      type: 'welcome',
      title: `Καλωσήρθατε, ${full_name?.split(' ')[0] || 'φίλε μας'}!`,
      body: '50 πόντοι προστέθηκαν στον λογαριασμό σας ως δώρο καλωσορίσματος.',
      link: '/account/loyalty',
    }).catch(() => {})
  }

  return { success: 'Ο λογαριασμός σας δημιουργήθηκε! Ελέγξτε το email σας για επιβεβαίωση.' }
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function forgotPasswordAction(_prevState: unknown, formData: FormData): Promise<{ error?: string; success?: string }> {
  const supabase = await createClient()

  const email = formData.get('email') as string

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
  })

  if (error) {
    return { error: 'Παρουσιάστηκε σφάλμα. Παρακαλώ δοκιμάστε ξανά.' }
  }

  return { success: 'Στείλαμε οδηγίες επαναφοράς κωδικού στο email σας.' }
}

export async function resetPasswordAction(_prevState: unknown, formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient()

  const password = formData.get('password') as string

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { error: 'Παρουσιάστηκε σφάλμα. Παρακαλώ δοκιμάστε ξανά.' }
  }

  revalidatePath('/', 'layout')
  redirect('/account')
}
