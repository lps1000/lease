'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

type NoteDetail = {
  id: number
  description: string
  created_at: string
  updated_at: string
  user_email: string
  customer_id: string
  customers: {
    name: string
    surname: string
  } | null
}

export default function NotitieDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [note, setNote] = useState<NoteDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const getData = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await supabase
          .from('notes')
          .select(`
            *,
            customers (
              name,
              surname
            )
          `)
          .eq('id', params.id)
          .single()

        if (error) throw error
        setNote(data)
      } catch (e) {
        setError('Er is een fout opgetreden bij het ophalen van de notitie.')
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    }
    getData()
  }, [params.id])

  if (isLoading) {
    return <div>Laden...</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  if (!note) {
    return <div>Notitie niet gevonden</div>
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-gray-900/50">
        <div className="h-full">
          <div className="border-b bg-white dark:bg-gray-800 shadow-sm">
            <div className="flex h-16 items-center gap-4 px-8">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Notitie Details
              </h1>
            </div>
          </div>

          <div className="container mx-auto py-8">
            <div className="grid gap-8">
              <Card>
                <CardHeader className="text-lg font-semibold">
                  Notitie Informatie
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Beschrijving</h2>
                    <p className="mt-1">{note.description}</p>
                  </div>
                  
                  <div>
                    <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Klant</h2>
                    <p className="mt-1">
                      {note.customers ? 
                        `${note.customers.name} ${note.customers?.surname || ''}` : 
                        'Onbekend'
                      }
                    </p>
                  </div>

                  <div>
                    <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Aangemaakt door</h2>
                    <p className="mt-1">{note.user_email}</p>
                  </div>

                  <div>
                    <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Aangemaakt op</h2>
                    <p className="mt-1">
                      {new Date(note.created_at).toLocaleDateString('nl-NL')}{' '}
                      {new Date(note.created_at).toLocaleTimeString('nl-NL', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>

                  {note.updated_at && (
                    <div>
                      <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Laatst gewijzigd</h2>
                      <p className="mt-1">
                        {new Date(note.updated_at).toLocaleDateString('nl-NL')}{' '}
                        {new Date(note.updated_at).toLocaleTimeString('nl-NL', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 