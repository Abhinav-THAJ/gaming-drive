export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string | null
          email: string
          phone: string | null
          role: 'user' | 'admin'
          created_at: string
        }
        Insert: {
          id: string
          name?: string | null
          email: string
          phone?: string | null
          role?: 'user' | 'admin'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          email?: string
          phone?: string | null
          role?: 'user' | 'admin'
        }
      }
      systems: {
        Row: {
          id: string
          name: string
          type: 'PC' | 'SIM' | 'PS5' | 'VR'
          status: 'available' | 'in-use' | 'maintenance'
          price_per_hour: number
        }
        Insert: {
          id?: string
          name: string
          type: 'PC' | 'SIM' | 'PS5' | 'VR'
          status?: 'available' | 'in-use' | 'maintenance'
          price_per_hour: number
        }
        Update: {
          id?: string
          name?: string
          type?: 'PC' | 'SIM' | 'PS5' | 'VR'
          status?: 'available' | 'in-use' | 'maintenance'
          price_per_hour?: number
        }
      }
      bookings: {
        Row: {
          id: string
          user_id: string
          system_id: string
          start_time: string
          end_time: string
          status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled'
          payment_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          system_id: string
          start_time: string
          end_time: string
          status?: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled'
          payment_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          system_id?: string
          start_time?: string
          end_time?: string
          status?: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled'
          payment_id?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
