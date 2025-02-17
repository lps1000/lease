'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { Sidebar } from "@/components/sidebar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// Type definitie voor een notitie
type Note = {
  id: number
  title: string
  description: string
  created_at: string
  updated_at: string
  user_email: string
  customer_id: string
  customers: {
    name: string
    surname: string
  }
}

export default function NotitiesPage() {
  const [notes, setNotes] = useState<Note[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

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
          .order('created_at', { ascending: false })

        if (error) throw error
        console.log('Notes data:', data)
        setNotes(data)
      } catch (e) {
        setError('Er is een fout opgetreden bij het ophalen van de notities.')
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    }
    getData()
  }, [])

  if (isLoading) {
    return <div>Laden...</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="w-[calc(100%-16rem)] flex-shrink-0 overflow-y-auto bg-gray-50/50 dark:bg-gray-900/50">
        <div className="h-full">
          <div className="border-b bg-white dark:bg-gray-800 shadow-sm">
            <div className="flex h-16 items-center px-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Notities
              </h1>
            </div>
          </div>
          
          <div className="p-8">
            <div className="rounded-lg border bg-white shadow-sm dark:bg-gray-800">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Beschrijving</TableHead>
                    <TableHead>Klant</TableHead>
                    <TableHead>Aangemaakt op</TableHead>
                    <TableHead>Laatst gewijzigd</TableHead>
                    <TableHead>Gebruiker</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notes && notes.length > 0 ? (
                    notes.map((note) => (
                      <TableRow 
                        key={note.id}
                        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => router.push(`/notities/${note.id}`)}
                      >
                        <TableCell>{note.description}</TableCell>
                        <TableCell>
                          {note.customers ? (
                            `${note.customers.name} ${note.customers?.surname || ''}`
                          ) : (
                            'Onbekend'
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(note.created_at).toLocaleDateString('nl-NL')}{' '}
                          {new Date(note.created_at).toLocaleTimeString('nl-NL', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </TableCell>
                        <TableCell>
                          {note.updated_at ? (
                            <>
                              {new Date(note.updated_at).toLocaleDateString('nl-NL')}{' '}
                              {new Date(note.updated_at).toLocaleTimeString('nl-NL', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </>
                          ) : (
                            'Niet gewijzigd'
                          )}
                        </TableCell>
                        <TableCell>{note.user_email}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        Geen notities gevonden
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 