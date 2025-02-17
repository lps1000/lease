"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { createClient } from '@/utils/supabase/client'
import { PostgrestError } from '@supabase/supabase-js'
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'

interface AddLeaserijderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (newCustomer: any) => void
}

// Voeg type definitie toe voor database kolommen
interface Customer {
  id: number
  name: string
  surname?: string
  email: string
  telephone: string
  street: string
  house_nr: string
  zipcode: string
  place: string
  date_of_birth: string
  client_since: string
}

export function AddLeaserijderDialog({ 
  open, 
  onOpenChange,
  onSuccess 
}: AddLeaserijderDialogProps) {
  const { toast } = useToast()
  const supabase = createClient()
  const [newRijder, setNewRijder] = useState({
    name: "",
    surname: "",
    phone: "",
    email: "",
    street: "",
    house_nr: "",
    postalCode: "",
    city: "",
    birthDate: "",
    invoiceNumber: "",
  })
  const [birthDate, setBirthDate] = useState<Date>()

  const handleAddRijder = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      // Update validatie voor verplichte velden
      const requiredFields = {
        name: 'Voornaam',
        surname: 'Achternaam',
        email: 'E-mailadres',
        phone: 'Telefoonnummer',
        street: 'Straatnaam',
        house_nr: 'Huisnummer',
        postalCode: 'Postcode',
        city: 'Plaats'
      };

      const emptyFields = Object.entries(requiredFields).filter(
        ([key]) => !newRijder[key as keyof typeof newRijder]
      );

      if (emptyFields.length > 0) {
        throw new Error(
          `De volgende velden zijn verplicht: ${emptyFields
            .map(([_, label]) => label)
            .join(', ')}`
        );
      }

      // Maak customerData object met conditionele date_of_birth
      const customerData = {
        name: newRijder.name.trim(),
        surname: newRijder.surname.trim(),
        email: newRijder.email.trim(),
        telephone: newRijder.phone.trim(),
        street: newRijder.street.trim(),
        house_nr: newRijder.house_nr.trim(),
        zipcode: newRijder.postalCode.trim(),
        place: newRijder.city.trim(),
        client_since: new Date().toISOString(),
      } as any;  // Gebruik any tijdelijk om dynamische property toe te voegen

      // Voeg date_of_birth alleen toe als er een waarde is
      if (birthDate) {
        customerData.date_of_birth = format(birthDate, 'yyyy-MM-dd');
      }
      
      console.log('Versturen van data:', customerData);

      const { data, error } = await supabase
        .from('customers')
        .insert([customerData])
        .select()
        .single();

      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(`Database fout: ${error.message}`);
      }

      if (!data) {
        throw new Error('Geen data ontvangen na toevoegen');
      }

      toast({
        title: "Succes",
        description: "Leaserijder succesvol toegevoegd",
        className: "bg-green-500 text-white",
      });
      
      // Reset form en sluit dialog
      onOpenChange(false);
      setNewRijder({
        name: "",
        surname: "",
        phone: "",
        email: "",
        street: "",
        house_nr: "",
        postalCode: "",
        city: "",
        birthDate: "",
        invoiceNumber: "",
      });

      if (onSuccess) {
        onSuccess(data);
      }
      
    } catch (error) {
      console.error('Volledige error:', error);
      
      let errorMessage = "Er is iets misgegaan bij het toevoegen van de rijder";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        errorMessage = JSON.stringify(error);
      }

      toast({
        variant: "destructive",
        title: "Fout",
        description: errorMessage,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nieuwe Leaserijder Toevoegen</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="name" className="flex items-center gap-1">
                Voornaam
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={newRijder.name}
                onChange={(e) => setNewRijder({ ...newRijder, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="surname" className="flex items-center gap-1">
                Achternaam
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="surname"
                value={newRijder.surname}
                onChange={(e) => setNewRijder({ ...newRijder, surname: e.target.value })}
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="phone" className="flex items-center gap-1">
              Telefoonnummer
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              value={newRijder.phone}
              onChange={(e) => setNewRijder({ ...newRijder, phone: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="email" className="flex items-center gap-1">
              E-mailadres
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={newRijder.email}
              onChange={(e) => setNewRijder({ ...newRijder, email: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-10 gap-3">
            <div className="col-span-8">
              <Label htmlFor="street" className="flex items-center gap-1">
                Straatnaam
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="street"
                value={newRijder.street}
                onChange={(e) => setNewRijder({ ...newRijder, street: e.target.value })}
                required
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="house_nr" className="flex items-center gap-1">
                Huisnummer
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="house_nr"
                value={newRijder.house_nr}
                onChange={(e) => setNewRijder({ ...newRijder, house_nr: e.target.value })}
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="postalCode" className="flex items-center gap-1">
              Postcode
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="postalCode"
              value={newRijder.postalCode}
              onChange={(e) => setNewRijder({ ...newRijder, postalCode: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="city" className="flex items-center gap-1">
              Plaats
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="city"
              value={newRijder.city}
              onChange={(e) => setNewRijder({ ...newRijder, city: e.target.value })}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label>Geboortedatum</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full pl-3 text-left font-normal",
                    !birthDate && "text-muted-foreground"
                  )}
                >
                  {birthDate ? (
                    format(birthDate, "PPP", { locale: nl })
                  ) : (
                    <span>Kies een datum</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={birthDate}
                  onSelect={setBirthDate}
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                  required
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuleren
          </Button>
          <Button onClick={handleAddRijder}>Toevoegen</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 