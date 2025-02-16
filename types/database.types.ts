export interface Note {
  id: string
  created_at: string
  content: string
  customer_id: string
  bike_id: string
  created_by: string
  customers: {
    name: string
  }
  bikes: {
    brand: string
    model: string
  }
  profiles: {
    full_name: string
  }
} 