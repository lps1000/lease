import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const cookieStore = cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    // Haal de data uit de formData
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const street = formData.get('street') as string
    const postalCode = formData.get('postalCode') as string
    const city = formData.get('city') as string
    const birthDate = formData.get('birthDate') as string
    const clientSince = formData.get('client_since') as string

    // Validatie
    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: 'Vul alle verplichte velden in' },
        { status: 400 }
      )
    }

    // Controleer of email al bestaat
    const { data: existingUser } = await supabase
      .from('customers')
      .select('email')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'Dit email adres is al geregistreerd' },
        { status: 400 }
      )
    }

    // Datum validatie en formatting
    let formattedBirthDate = null
    if (birthDate) {
      // Controleer of de datum geldig is
      const dateObj = new Date(birthDate)
      if (isNaN(dateObj.getTime())) {
        return NextResponse.json(
          { error: 'Ongeldige geboortedatum' },
          { status: 400 }
        )
      }
      formattedBirthDate = dateObj.toISOString().split('T')[0]
    }

    // Split name into name and surname
    const nameParts = name.trim().split(" ")
    const surname = nameParts.pop() || ""
    const firstName = nameParts.join(" ")

    // Split street into street and house number
    const streetParts = street ? street.trim().split(" ") : ["", ""]
    const houseNr = streetParts.pop() || ""
    const streetName = streetParts.join(" ")

    const customerData = {
      name: firstName,
      surname: surname,
      email: email,
      telephone: phone,
      street: streetName,
      house_nr: houseNr,
      zipcode: postalCode || null,
      place: city || null,
      date_of_birth: formattedBirthDate,
      client_since: clientSince,
    }

    const { data, error } = await supabase
      .from('customers')
      .insert(customerData)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Database error: ' + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Klant is succesvol toegevoegd',
      data: data
    })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Server error: ' + (error as Error).message },
      { status: 500 }
    )
  }
} 