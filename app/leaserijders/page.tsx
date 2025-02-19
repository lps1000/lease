"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Wrench, StickyNote, Plus } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { fetchCustomerById, type TeamleaderCustomer } from "@/utils/teamleader-api"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Customers } from '@/app/types/database'
import { useRouter } from "next/navigation"
import { MaintenanceDialog } from "@/app/components/maintenance-dialog"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { NoteDialog } from "@/components/note-dialog"
import { AddLeaserijderDialog } from "@/app/components/add-leaserijder-dialog"

export default function LeaserijdersPage() {
  const { toast } = useToast()
  const [customers, setCustomers] = useState<Customers[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20
  const supabase = createClientComponentClient()
  const [noteFormData, setNoteFormData] = useState<{
    rijderId: number;
    rijderName: string;
    note: string;
  }>({
    rijderId: 0,
    rijderName: "",
    note: ""
  })
  const [showAddDialog, setShowAddDialog] = useState(false)
  const router = useRouter()
  const [maintenanceOpen, setMaintenanceOpen] = useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("")
  const [noteDialogOpen, setNoteDialogOpen] = useState(false)

  const getData = async () => {
    try {
      setIsLoading(true);
      const { data: customers, error } = await supabase
        .from('customers')
        .select('id, name, surname, email, telephone, zipcode, street, client_since')
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

      if (error) {
        console.error('Supabase query error:', error);
        throw new Error(`Fout bij ophalen data: ${error.message}`);
      }

      if (!customers) {
        return [];
      }

      return customers;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getData();
        // Explicitly type the data to match Customers[] interface
        const typedData = data.map(customer => ({
          id: customer.id,
          name: customer.name,
          surname: customer.surname,
          email: customer.email,
          telephone: customer.telephone,
          zipcode: customer.zipcode,
          street: customer.street,
          place: '', // Add missing required fields
          date_of_birth: null,
          client_since: customer.client_since,
          teamleader_id: null,
          house_nr: ''
        }));
        setCustomers(typedData.map(customer => ({
          ...customer,
          date_of_birth: customer.date_of_birth || '', // Convert null to empty string
          client_since: customer.client_since || '',
          teamleader_id: customer.teamleader_id || ''
        })));
      } catch (error) {
        console.error('Failed to fetch customers:', error);
        setError(error instanceof Error ? error.message : 'Er is een fout opgetreden');
      }
    };

    fetchData();
  }, [currentPage]);

  const filteredCustomers = customers?.filter((customer) =>
    Object.values(customer).some((value) =>
      value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  ) || []

  const handleNoteSubmit = async () => {
    try {
      // Hier komt de logica voor het opslaan van de notitie
      console.log('Notitie opslaan:', noteFormData)
      // Reset form
      setNoteFormData({ rijderId: 0, rijderName: "", note: "" })
    } catch (error) {
      console.error('Fout bij opslaan notitie:', error)
    }
  }

  const handleMaintenanceClick = (customerId: string) => {
    setSelectedCustomerId(customerId)
    setMaintenanceOpen(true)
  }

  const handleMaintenanceSaved = async () => {
    // Refresh data after maintenance is saved
    const data = await getData()
    // ... rest of your data processing code ...
  }

  const handleNoteClick = (customerId: string, customerName: string) => {
    setNoteFormData({
      rijderId: parseInt(customerId),
      rijderName: customerName,
      note: ""
    })
    setNoteDialogOpen(true)
  }

  const handleNoteSaved = async () => {
    setNoteDialogOpen(false)
    toast({
      title: "Notitie opgeslagen",
      description: "De notitie is succesvol opgeslagen.",
    })
  }

  if (isLoading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-gray-900/50">
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-gray-900/50">
          <div className="flex justify-center items-center h-full">
            <div className="text-red-500">{error}</div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-gray-900/50">
        <div className="h-full">
          <div className="border-b bg-white dark:bg-gray-800 shadow-sm">
            <div className="flex h-16 items-center px-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Leaserijders
              </h1>
              <Button
                onClick={() => setShowAddDialog(true)}
                className="ml-4"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nieuwe Rijder
              </Button>
              <div className="relative ml-auto w-72">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Zoeken..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>

          <AddLeaserijderDialog 
            open={showAddDialog} 
            onOpenChange={setShowAddDialog}
            onSuccess={() => {
              // Refresh the data after successful addition
              getData().then(data => {
                const typedData = data.map(customer => ({
                  id: customer.id,
                  name: customer.name,
                  surname: customer.surname,
                  email: customer.email,
                  telephone: customer.telephone,
                  zipcode: customer.zipcode,
                  street: customer.street,
                  place: '',
                  date_of_birth: null,
                  client_since: null,
                  teamleader_id: null,
                  house_nr: ''
                }));
                setCustomers(typedData.map(customer => ({
                  ...customer,
                  date_of_birth: customer.date_of_birth || '',
                  client_since: customer.client_since || '',
                  teamleader_id: customer.teamleader_id || ''
                })));
              });
            }}
          />

          <div className="max-w-full space-y-8 p-8">
            {/* Top pagination controls */}
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-muted-foreground">
                Pagina {currentPage}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Vorige
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={!customers || customers.length < itemsPerPage}
                >
                  Volgende
                </Button>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Naam</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefoon</TableHead>
                  <TableHead>Postcode</TableHead>
                  <TableHead>Toegevoegd op</TableHead>
                  <TableHead className="text-right">Acties</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <TableRow 
                      key={customer.id} 
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      onClick={() => router.push(`/leaserijders/${customer.id}`)}
                    >
                      <TableCell className="font-medium">
                        {`${customer.name} ${customer.surname}`}
                      </TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{customer.telephone}</TableCell>
                      <TableCell>{customer.zipcode}</TableCell>
                      <TableCell>
                        {customer.client_since 
                          ? new Date(customer.client_since).toLocaleDateString('nl-NL', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })
                          : '-'
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="sm"
                            variant="default"
                            className="flex items-center gap-1"
                            onClick={() => handleMaintenanceClick(customer.id.toString())}
                          >
                            <Wrench className="h-4 w-4" />
                            Onderhoud
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              handleNoteClick(
                                customer.id.toString(), 
                                `${customer.name} ${customer.surname}`
                              )
                            }}
                          >
                            <StickyNote className="h-4 w-4" />
                            Notitie
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      Geen klanten gevonden
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
      <Toaster />
      <MaintenanceDialog
        open={maintenanceOpen}
        onOpenChange={setMaintenanceOpen}
        customerId={selectedCustomerId}
        onMaintenanceSaved={handleMaintenanceSaved}
      />
      <NoteDialog 
        open={noteDialogOpen}
        onOpenChange={setNoteDialogOpen}
        customerId={noteFormData.rijderId.toString()}
        customerName={noteFormData.rijderName}
        onNoteSaved={handleNoteSaved}
      />
    </div>
  )
}