
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
          auth_id: string
          email: string
          full_name: string | null
          role: Database['public']['Enums']['app_role']
          created_at: string
        }
        Insert: {
          id?: string
          auth_id: string
          email: string
          full_name?: string | null
          role?: Database['public']['Enums']['app_role']
          created_at?: string
        }
        Update: {
          id?: string
          auth_id?: string
          email?: string
          full_name?: string | null
          role?: Database['public']['Enums']['app_role']
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          customer_id: string | null
          status: Database['public']['Enums']['order_status']
          total_value: number
          neighborhood: string | null
          created_at: string
        }
        Insert: {
          id?: string
          customer_id?: string | null
          status?: Database['public']['Enums']['order_status']
          total_value: number
          neighborhood?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          customer_id?: string | null
          status?: Database['public']['Enums']['order_status']
          total_value?: number
          neighborhood?: string | null
          created_at?: string
        }
      }
      order_status_history: {
        Row: {
          id: string
          order_id: string
          previous_status: Database['public']['Enums']['order_status'] | null
          new_status: Database['public']['Enums']['order_status']
          changed_by: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          previous_status?: Database['public']['Enums']['order_status'] | null
          new_status: Database['public']['Enums']['order_status']
          changed_by?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          previous_status?: Database['public']['Enums']['order_status'] | null
          new_status?: Database['public']['Enums']['order_status']
          changed_by?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          image_url?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database['public']['Enums']['app_role']
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      app_role: 'admin' | 'manager' | 'operator' | 'user'
      order_status: 'pending' | 'confirmed' | 'preparing' | 'delivering' | 'completed' | 'cancelled'
    }
  }
}
