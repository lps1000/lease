import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// Update de URLs naar de correcte Focus endpoints
const TEAMLEADER_AUTH_URL = 'https://focus.teamleader.eu/oauth2/authorize'
const TEAMLEADER_TOKEN_URL = 'https://focus.teamleader.eu/oauth2/access_token'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    
    if (!code) {
      throw new Error('No authorization code received')
    }

    const response = await fetch(process.env.TEAMLEADER_TOKEN_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.TEAMLEADER_CLIENT_ID,
        client_secret: process.env.TEAMLEADER_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.TEAMLEADER_REDIRECT_URI,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to fetch access token')
    }

    const tokens = await response.json()
    
    // Store tokens in Supabase
    const supabase = createRouteHandlerClient({ cookies })
    await supabase.from('teamleader_tokens').upsert({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
    })

    return NextResponse.redirect(new URL('/', request.url))
  } catch (error) {
    console.error('Authentication error:', error)
    return NextResponse.redirect(new URL('/error', request.url))
  }
} 