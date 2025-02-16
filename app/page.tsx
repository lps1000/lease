import { createClient } from '@/utils/supabase/server'
import Dashboard from './dashboard/page'
import { SignIn } from '@/components/auth/sign-in'

export default async function RootPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (session) {
    return <Dashboard />
  }

  return <SignIn />
}
