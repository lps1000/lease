import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current refresh token
    const { data: tokenData } = await supabase
      .from('teamleader_tokens')
      .select('refresh_token')
      .single()

    if (!tokenData?.refresh_token) {
      throw new Error('No refresh token found')
    }

    const response = await fetch(process.env.TEAMLEADER_TOKEN_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.TEAMLEADER_CLIENT_ID,
        client_secret: process.env.TEAMLEADER_CLIENT_SECRET,
        refresh_token: tokenData.refresh_token,
        grant_type: 'refresh_token',
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to refresh token')
    }

    const tokens = await response.json()
    
    // Update tokens in Supabase
    await supabase.from('teamleader_tokens').upsert({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Token refresh error:', error)
    return NextResponse.json({ error: 'Failed to refresh token' }, { status: 500 })
  }
} 