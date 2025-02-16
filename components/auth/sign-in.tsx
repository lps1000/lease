'use client'

import { Auth } from '@supabase/auth-ui-react'
import { createClient } from '@/utils/supabase/client'
import { ThemeSupa } from '@supabase/auth-ui-shared'

export function SignIn() {
  const supabase = createClient()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full max-w-sm">
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={['google']}
          redirectTo={`${window.location.origin}/auth/callback`}
        />
      </div>
    </div>
  )
} 