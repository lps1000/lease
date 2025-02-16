export type Database = {
  public: {
    Tables: {
      customers: {
        Row: {
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
        }
        Insert: {
          id?: number
          name: string
          surname: string
          telephone?: string
          email?: string
          street?: string
          zipcode?: string
          place?: string
          date_of_birth?: string
          client_since?: string
          teamleader_id?: string
          house_nr?: string
        }
        Update: {
          id?: number
          name?: string
          surname?: string
          telephone?: string
          email?: string
          street?: string
          zipcode?: string
          place?: string
          date_of_birth?: string
          client_since?: string
          teamleader_id?: string
          house_nr?: string
        }
      }
    }
  }
} 