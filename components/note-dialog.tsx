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
import { StickyNote } from "lucide-react"
import { useState } from "react"

interface NoteDialogProps {
  rijderId: number
  rijderName: string
}

export function NoteDialog({ rijderId, rijderName }: NoteDialogProps) {
  const [note, setNote] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const handleSubmit = async () => {
    try {
      // Hier komt de logica voor het opslaan van de notitie
      console.log('Notitie opslaan voor rijder:', rijderId, note)
      setIsOpen(false)
      setNote("")
    } catch (error) {
      console.error('Fout bij opslaan notitie:', error)
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
          <Textarea
            placeholder="Schrijf hier je notitie..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Annuleren
            </Button>
            <Button onClick={handleSubmit}>Opslaan</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
