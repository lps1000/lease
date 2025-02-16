export type Customers = {
  id: number
  name: string
  surname: string
  telephone: string
  email: string
  street: string
  zipcode: string
  place: string
  date_of_birth: string
  client_since: string
  teamleader_id: string
  house_nr: string
  notes?: string
}

export type CustomerFormData = Omit<Customers, 'id' | 'client_since' | 'teamleader_id'>

export interface Note {
  id?: number
  customer_id: number
  content: string
  created_at?: string
}

export interface Maintenance {
  id?: number
  customer_id: number
  maintenance_date: string
  next_maintenance_date: string
  notes?: string
  invoice_url?: string
  invoice_number?: string
  created_at?: string
} 