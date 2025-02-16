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
import { toast } from "sonner"

interface NoteDialogProps {
  rijderId: number
  rijderName: string
}

export function NoteDialog({ rijderId, rijderName }: NoteDialogProps) {
  const [note, setNote] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClient()
  const currentDateTime = new Date().toLocaleString('nl-NL', {
    dateStyle: 'long',
    timeStyle: 'short'
  })

  const handleSubmit = async () => {
    if (!note.trim()) {
      toast.error("Voer eerst een notitie in")
      return
    }

    setIsSubmitting(true)
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert({
          description: note.trim(),
          customer_id: rijderId,
          created_at: new Date().toISOString()
        })
        .select()

      if (error) {
        console.error('Supabase error details:', error)
        throw new Error(error.message)
      }

      toast.success("Notitie is opgeslagen")
      setIsOpen(false)
      setNote("")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Onbekende fout'
      console.error('Fout bij opslaan notitie:', errorMessage)
      toast.error(`Er is iets misgegaan bij het opslaan van de notitie: ${errorMessage}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="flex items-center gap-1"
        >
          <StickyNote className="h-4 w-4" />
          Notitie
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Notitie voor {rijderName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Leaserijder</label>
            <Input 
              value={rijderName}
              readOnly
              className="bg-muted"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Datum en tijd</label>
            <Input 
              value={currentDateTime}
              readOnly
              className="bg-muted"
            />
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
            <Button variant="outline" onClick={() => setIsOpen(false)}>
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
