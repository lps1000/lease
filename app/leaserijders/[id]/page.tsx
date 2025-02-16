"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft } from "lucide-react"
import { createClient } from '@/utils/supabase/client'
import { Customers } from '@/app/types/database'
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// Creëer de Supabase client buiten de component
const supabase = createClient()

// Update the CustomerFormData interface to match database fields
interface CustomerFormData {
  name: string
  surname: string
  telephone: string
  email: string
  street: string
  house_nr: string
  zipcode: string
  place: string
  date_of_birth?: string
  client_since?: string
}

export default function LeaserijderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const { register, handleSubmit, reset, watch, setValue } = useForm<CustomerFormData>()

  useEffect(() => {
    const fetchCustomer = async () => {
      if (!params.id) return

      try {
        setIsLoading(true)
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('id', params.id)
          .single()

        if (error) throw error

        reset({
          name: data.name,
          surname: data.surname,
          telephone: data.telephone,      // Changed from phone to telephone
          email: data.email,
          street: data.street,
          house_nr: data.house_nr,
          zipcode: data.zipcode,         // Changed from postalCode to zipcode
          place: data.place,             // Changed from city to place
          date_of_birth: data.date_of_birth,
        })
      } catch (error) {
        console.error('Error fetching customer:', error)
        toast({
          variant: "destructive",
          title: "Fout",
          description: "Kon de klantgegevens niet ophalen",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCustomer()
  }, [params.id, toast, reset])

  const onSubmit = async (data: CustomerFormData) => {
    try {
      setIsSaving(true)
      const { error } = await supabase
        .from('customers')
        .update(data)
        .eq('id', params.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Klantgegevens zijn bijgewerkt",
      })
    } catch (error) {
      console.error('Error updating customer:', error)
      toast({
        variant: "destructive",
        title: "Fout",
        description: "Kon de klantgegevens niet bijwerken",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar basePath="/" />
        <main className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-gray-900/50">
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar basePath="/" />
      <main className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-gray-900/50">
        <div className="h-full">
          <div className="border-b bg-white dark:bg-gray-800 shadow-sm">
            <div className="flex h-16 items-center px-8">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Terug
              </Button>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Leaserijder Details
              </h1>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto p-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h2 className="text-lg font-semibold mb-4">Persoonlijke Informatie</h2>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Voornaam</Label>
                      <Input id="name" {...register('name')} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="surname">Achternaam</Label>
                      <Input id="surname" {...register('surname')} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" {...register('email')} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telephone">Telefoon</Label>
                      <Input id="telephone" {...register('telephone')} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date_of_birth">Geboortedatum</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !watch('date_of_birth') && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {watch('date_of_birth') ? (
                              format(new Date(watch('date_of_birth') || ''), "dd-MM-yyyy")
                            ) : (
                              <span>Kies een datum</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={watch('date_of_birth') ? new Date(watch('date_of_birth') || '') : undefined}
                            onSelect={(date) => setValue('date_of_birth', date ? format(date, 'yyyy-MM-dd') : '')}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold mb-4">Adresgegevens</h2>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="street">Straat</Label>
                      <Input id="street" {...register('street')} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="house_nr">Huisnummer</Label>
                      <Input id="house_nr" {...register('house_nr')} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipcode">Postcode</Label>
                      <Input id="zipcode" {...register('zipcode')} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="place">Plaats</Label>
                      <Input id="place" {...register('place')} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t">
                <h2 className="text-lg font-semibold mb-4">Klantinformatie</h2>
                <div>
                  <Label className="text-sm text-gray-500 dark:text-gray-400">Klant sinds</Label>
                  <p className="font-medium">{new Date().toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Opslaan..." : "Wijzigingen opslaan"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
} 