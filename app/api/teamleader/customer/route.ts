import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const TEAMLEADER_API_URL = 'https://api.focus.teamleader.eu/contacts.list'

async function refreshToken() {
  const response = await fetch('/api/teamleader/refresh', {
    method: 'POST',
  })
  return response.ok
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    // Get token from cookie
    const cookieStore = await cookies()
    const token = cookieStore.get('teamleader_token')

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    let response = await fetch(TEAMLEADER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.value}`,
      },
      body: JSON.stringify({
        // API verwacht een filter object voor het zoeken op ID
        filter: id ? {
          ids: [id]
        } : {},
        page: {
          size: 20
        }
      }),
    })

    // Als de token verlopen is, probeer te refreshen
    if (response.status === 401) {
      const refreshed = await refreshToken()
      if (refreshed) {
        // Herhaal de oorspronkelijke request met nieuwe token
        const newToken = cookieStore.get('teamleader_token')
        response = await fetch(TEAMLEADER_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${newToken!.value}`,
          },
          body: JSON.stringify({
            filter: id ? {
              ids: [id]
            } : {},
            page: {
              size: 20
            }
          }),
        })
      }
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Teamleader API error:', errorText)
      throw new Error(`Teamleader API error: ${response.statusText}`)
    }

    const data = await response.json()
    // Als we op ID zoeken, stuur dan de eerste klant terug
    const customer = id ? data.data[0] : data.data
    return NextResponse.json({ customer })
  } catch (error) {
    console.error('Error fetching customer from Teamleader:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customer from Teamleader' },
      { status: 500 }
    )
  }
} 