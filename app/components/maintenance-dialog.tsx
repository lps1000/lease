"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from '@/utils/supabase/client'
import { useToast } from "@/hooks/use-toast"
import { useState, useCallback } from "react"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon, Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { nl } from "date-fns/locale"
import { Maintenance } from "@/app/types/database"
import { Input } from "@/components/ui/input"

interface MaintenanceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customerId: string
  onMaintenanceSaved: () => Promise<void>
}

export function MaintenanceDialog({
  open,
  onOpenChange,
  customerId,
  onMaintenanceSaved,
}: MaintenanceDialogProps) {
  const [maintenanceDate, setMaintenanceDate] = useState<Date>(new Date())
  const [nextMaintenanceDate, setNextMaintenanceDate] = useState<Date>(() => {
    const nextDate = new Date()
    nextDate.setFullYear(nextDate.getFullYear() + 1)
    return nextDate
  })
  const [maintenanceDateOpen, setMaintenanceDateOpen] = useState(false)
  const [nextMaintenanceDateOpen, setNextMaintenanceDateOpen] = useState(false)
  const [notes, setNotes] = useState('')
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()
  const [errors, setErrors] = useState<{
    maintenanceDate?: string;
    nextMaintenanceDate?: string;
    invoiceNumber?: string;
  }>({})

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleMaintenanceDateChange = (date: Date | undefined) => {
    if (date) {
      setMaintenanceDate(date)
      setMaintenanceDateOpen(false)
      const nextDate = new Date(date)
      nextDate.setFullYear(nextDate.getFullYear() + 1)
      setNextMaintenanceDate(nextDate)
    }
  }

  const handleNextMaintenanceDateChange = (date: Date | undefined) => {
    if (date) {
      setNextMaintenanceDate(date)
      setNextMaintenanceDateOpen(false)
    }
  }

  const handleFileDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0])
    }
  }, [])

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {}

    if (!maintenanceDate) {
      newErrors.maintenanceDate = "Datum onderhoudsbeurt is verplicht"
    }

    if (!nextMaintenanceDate) {
      newErrors.nextMaintenanceDate = "Volgende onderhoudsbeurt is verplicht"
    }

    if (!invoiceNumber?.trim()) {
      newErrors.invoiceNumber = "Factuurnummer is verplicht"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Fout",
        description: "Vul alle verplichte velden in",
      })
      return
    }

    // Ensure we have valid dates before proceeding
    if (!maintenanceDate || !nextMaintenanceDate) {
      toast({
        variant: "destructive",
        title: "Fout",
        description: "Datums zijn verplicht",
      })
      return
    }

    try {
      setIsSaving(true)
      let invoice_url = undefined

      if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${customerId}-${Date.now()}.${fileExt}`
        const { error: uploadError, data } = await supabase
          .storage
          .from('maintenance-invoices')
          .upload(fileName, file)

        if (uploadError) {
          throw new Error(`Fout bij uploaden: ${uploadError.message}`)
        }
        if (data) invoice_url = data.path
      }

      const maintenanceRecord: Maintenance = {
        customer_id: parseInt(customerId),
        maintenance_date: maintenanceDate.toISOString(),
        next_maintenance_date: nextMaintenanceDate.toISOString(),
        notes: notes || '',
        invoice_url,
        invoice_number: invoiceNumber.trim()
      }

      const { error: insertError } = await supabase
        .from('maintenance')
        .insert(maintenanceRecord)

      if (insertError) {
        throw new Error(`Database fout: ${insertError.message}`)
      }

      toast({
        title: "Success",
        description: "Onderhoudsgegevens zijn opgeslagen",
      })
      
      // Reset form
      onOpenChange(false)
      setMaintenanceDate(new Date())
      setNextMaintenanceDate(() => {
        const nextDate = new Date()
        nextDate.setFullYear(nextDate.getFullYear() + 1)
        return nextDate
      })
      setNotes('')
      setFile(null)
      setInvoiceNumber('')
      
      // Safely call onMaintenanceSaved if it exists
      if (typeof onMaintenanceSaved === 'function') {
        await onMaintenanceSaved()
      }
    } catch (error) {
      console.error('Error in handleSave:', error)
      
      let errorMessage = 'Er is een onverwachte fout opgetreden'
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      }
      
      toast({
        variant: "destructive",
        title: "Fout",
        description: errorMessage,
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Onderhoud Registreren</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label className="flex">
              Datum Onderhoudsbeurt
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Popover open={maintenanceDateOpen} onOpenChange={setMaintenanceDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !maintenanceDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {maintenanceDate ? (
                    format(maintenanceDate, "PPP", { locale: nl })
                  ) : (
                    <span>Kies een datum</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={maintenanceDate}
                  onSelect={handleMaintenanceDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.maintenanceDate && (
              <p className="text-sm text-red-500">{errors.maintenanceDate}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label className="flex">
              Volgende Onderhoudsbeurt
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Popover open={nextMaintenanceDateOpen} onOpenChange={setNextMaintenanceDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !nextMaintenanceDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {nextMaintenanceDate ? (
                    format(nextMaintenanceDate, "PPP", { locale: nl })
                  ) : (
                    <span>Kies een datum</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={nextMaintenanceDate}
                  onSelect={handleNextMaintenanceDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.nextMaintenanceDate && (
              <p className="text-sm text-red-500">{errors.nextMaintenanceDate}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="invoice-number" className="flex">
              Factuurnummer
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="invoice-number"
              value={invoiceNumber}
              onChange={(e) => {
                setInvoiceNumber(e.target.value)
                if (errors.invoiceNumber) {
                  setErrors((prev) => ({ ...prev, invoiceNumber: undefined }))
                }
              }}
              placeholder="Voer factuurnummer in"
              className={cn(errors.invoiceNumber && "border-red-500")}
            />
            {errors.invoiceNumber && (
              <p className="text-sm text-red-500">{errors.invoiceNumber}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="maintenance-notes">Opmerkingen</Label>
            <Textarea
              id="maintenance-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Welke werkzaamheden zijn er uitgevoerd?"
              className="min-h-[100px]"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="invoice">Factuur Upload</Label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <div
                className="relative cursor-pointer p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  const droppedFiles = Array.from(e.dataTransfer.files)
                  if (droppedFiles.length > 0) {
                    setFile(droppedFiles[0])
                  }
                }}
              >
                <input
                  type="file"
                  id="invoice"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept="application/pdf,image/*"
                  onChange={handleFileChange}
                />
                <div className="text-center">
                  {file ? (
                    <div className="flex items-center justify-center gap-2">
                      <Upload className="h-4 w-4 text-primary" />
                      <span className="text-sm text-muted-foreground">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setFile(null)
                        }}
                      >
                        Verwijder
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-1">
                        Sleep een bestand hierheen of klik om te uploaden
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PDF of afbeeldingen toegestaan
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false)
                setMaintenanceDate(new Date())
                setNextMaintenanceDate(() => {
                  const nextDate = new Date()
                  nextDate.setFullYear(nextDate.getFullYear() + 1)
                  return nextDate
                })
                setNotes('')
                setFile(null)
                setInvoiceNumber('')
              }}
            >
              Annuleren
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? "Opslaan..." : "Opslaan"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 