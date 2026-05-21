
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
          auth_id: string | null
          name: string | null
          email: string
          phone: string | null
          role: 'admin' | 'manager' | 'operator' | 'user'
          avatar_url: string | null
          active: boolean
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          auth_id?: string | null
          name?: string | null
          email: string
          phone?: string | null
          role?: 'admin' | 'manager' | 'operator' | 'user'
          avatar_url?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          auth_id?: string | null
          name?: string | null
          email?: string
          phone?: string | null
          role?: 'admin' | 'manager' | 'operator' | 'user'
          avatar_url?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      customers: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          document: string | null
          address: string | null
          city: string | null
          state: string | null
          zipcode: string | null
          notes: string | null
          active: boolean
          created_by: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone?: string | null
          document?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zipcode?: string | null
          notes?: string | null
          active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string | null
          document?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zipcode?: string | null
          notes?: string | null
          active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      orders: {
        Row: {
          id: string
          customer_id: string | null
          user_id: string | null
          status: 'pending' | 'confirmed' | 'preparing' | 'delivering' | 'completed' | 'cancelled'
          payment_method: string | null
          subtotal: number
          delivery_fee: number
          total: number
          notes: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          customer_id?: string | null
          user_id?: string | null
          status?: 'pending' | 'confirmed' | 'preparing' | 'delivering' | 'completed' | 'cancelled'
          payment_method?: string | null
          subtotal?: number
          delivery_fee?: number
          total: number
          notes?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          customer_id?: string | null
          user_id?: string | null
          status?: 'pending' | 'confirmed' | 'preparing' | 'delivering' | 'completed' | 'cancelled'
          payment_method?: string | null
          subtotal?: number
          delivery_fee?: number
          total?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          image_url: string | null
          stock: number
          active: boolean
          created_by: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          image_url?: string | null
          stock?: number
          active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          image_url?: string | null
          stock?: number
          active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
    }
    Enums: {
      app_role: 'admin' | 'manager' | 'operator' | 'user'
      order_status: 'pending' | 'confirmed' | 'preparing' | 'delivering' | 'completed' | 'cancelled'
    }
  }
}
