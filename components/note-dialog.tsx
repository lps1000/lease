"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { StickyNote } from "lucide-react"
import { useState } from "react"
import { createClient } from '@/utils/supabase/client'
import { toast } from "@/components/hooks/use-toast"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { nl } from 'date-fns/locale'
import { Label } from "@/components/ui/label"

interface NoteDialogProps {
  customerId: string;
  customerName: string;
  onNoteSaved: () => Promise<void>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NoteDialog({ 
  customerId, 
  customerName,
  onNoteSaved, 
  open, 
  onOpenChange 
}: NoteDialogProps) {
  const [note, setNote] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClient()
  const [date, setDate] = useState<Date>(new Date())

  const handleSubmit = async () => {
    if (!note.trim()) {
      toast({
        variant: "destructive",
        title: "Voer eerst een notitie in"
      })
      return
    }

    setIsSubmitting(true)
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert({
          description: note.trim(),
          customer_id: customerId,
          created_at: date.toISOString()
        })
        .select()

      if (error) {
        console.error('Supabase error details:', error)
        throw new Error(error.message)
      }

      toast({
        title: "Notitie is opgeslagen"
      })
      onOpenChange(false)
      setNote("")
      await onNoteSaved()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Onbekende fout'
      console.error('Fout bij opslaan notitie:', errorMessage)
      toast({
        variant: "destructive",
        title: "Er is iets misgegaan",
        description: `Fout bij het opslaan van de notitie: ${errorMessage}`
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Notitie voor {customerName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label>Datum en tijd</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full pl-3 text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  {format(date, "PPP", { locale: nl })}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate: Date | undefined) => setDate(newDate || new Date())}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Notitie</label>
            <Textarea
              placeholder="Schrijf hier je notitie..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuleren
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Opslaan..." : "Opslaan"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
