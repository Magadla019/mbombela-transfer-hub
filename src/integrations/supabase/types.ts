export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      ads: {
        Row: {
          category: string
          clicks: number
          created_at: string
          created_by: string | null
          cta_text: string
          id: string
          image_url: string | null
          is_active: boolean
          priority: number
          target_id: string | null
          target_type: string | null
          target_url: string
          title: string
        }
        Insert: {
          category: string
          clicks?: number
          created_at?: string
          created_by?: string | null
          cta_text?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          priority?: number
          target_id?: string | null
          target_type?: string | null
          target_url: string
          title: string
        }
        Update: {
          category?: string
          clicks?: number
          created_at?: string
          created_by?: string | null
          cta_text?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          priority?: number
          target_id?: string | null
          target_type?: string | null
          target_url?: string
          title?: string
        }
        Relationships: []
      }
      ai_chats: {
        Row: {
          action_type: string | null
          ai_response: string | null
          created_at: string
          id: string
          partner_id: string | null
          provider: string | null
          user_prompt: string
        }
        Insert: {
          action_type?: string | null
          ai_response?: string | null
          created_at?: string
          id?: string
          partner_id?: string | null
          provider?: string | null
          user_prompt: string
        }
        Update: {
          action_type?: string | null
          ai_response?: string | null
          created_at?: string
          id?: string
          partner_id?: string | null
          provider?: string | null
          user_prompt?: string
        }
        Relationships: []
      }
      app_pricing: {
        Row: {
          category: string
          id: string
          is_active: boolean
          label: string | null
          price: number
          sub_category: string
          updated_at: string
        }
        Insert: {
          category: string
          id?: string
          is_active?: boolean
          label?: string | null
          price?: number
          sub_category: string
          updated_at?: string
        }
        Update: {
          category?: string
          id?: string
          is_active?: boolean
          label?: string | null
          price?: number
          sub_category?: string
          updated_at?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          client_id: string
          client_name: string | null
          id: string
          last_message: string | null
          order_id: string | null
          partner_id: string
          updated_at: string
        }
        Insert: {
          client_id: string
          client_name?: string | null
          id?: string
          last_message?: string | null
          order_id?: string | null
          partner_id?: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          client_name?: string | null
          id?: string
          last_message?: string | null
          order_id?: string | null
          partner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      driver_access: {
        Row: {
          created_at: string
          driver_name: string | null
          driver_phone: string | null
          first_login: boolean
          id: string
          is_active: boolean
          password: string
          total_completed: number
          total_income: number
        }
        Insert: {
          created_at?: string
          driver_name?: string | null
          driver_phone?: string | null
          first_login?: boolean
          id?: string
          is_active?: boolean
          password: string
          total_completed?: number
          total_income?: number
        }
        Update: {
          created_at?: string
          driver_name?: string | null
          driver_phone?: string | null
          first_login?: boolean
          id?: string
          is_active?: boolean
          password?: string
          total_completed?: number
          total_income?: number
        }
        Relationships: []
      }
      driver_locations: {
        Row: {
          driver_id: string
          heading: number | null
          id: string
          lat: number
          lng: number
          order_id: string
          updated_at: string
        }
        Insert: {
          driver_id: string
          heading?: number | null
          id?: string
          lat: number
          lng: number
          order_id: string
          updated_at?: string
        }
        Update: {
          driver_id?: string
          heading?: number | null
          id?: string
          lat?: number
          lng?: number
          order_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      drivers_live: {
        Row: {
          driver_id: string
          is_online: boolean
          lat: number | null
          lng: number | null
          updated_at: string
        }
        Insert: {
          driver_id: string
          is_online?: boolean
          lat?: number | null
          lng?: number | null
          updated_at?: string
        }
        Update: {
          driver_id?: string
          is_online?: boolean
          lat?: number | null
          lng?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      env_vault: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_required: boolean
          key_name: string
          key_value: string | null
          platform_group: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_required?: boolean
          key_name: string
          key_value?: string | null
          platform_group?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_required?: boolean
          key_name?: string
          key_value?: string | null
          platform_group?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      menu_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          restaurant_id: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          restaurant_id: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          restaurant_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "menu_categories_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          category_id: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_available: boolean
          is_featured: boolean
          name: string
          price: number
          restaurant_id: string
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean
          is_featured?: boolean
          name: string
          price?: number
          restaurant_id: string
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean
          is_featured?: boolean
          name?: string
          price?: number
          restaurant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_restaurant_id_fkey"
            columns: ["category_id", "restaurant_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id", "restaurant_id"]
          },
          {
            foreignKeyName: "menu_items_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_sync_logs: {
        Row: {
          created_at: string
          id: string
          message: string | null
          restaurant_slug: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          restaurant_slug: string
          status: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          restaurant_slug?: string
          status?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          image_url: string | null
          is_read: boolean
          sender_id: string
          text: string | null
          voice_url: string | null
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_read?: boolean
          sender_id: string
          text?: string | null
          voice_url?: string | null
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_read?: boolean
          sender_id?: string
          text?: string | null
          voice_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount: number
          assigned_at: string | null
          brand: string | null
          client_popup_shown: boolean
          client_popup_state: string | null
          completed_at: string | null
          created_at: string
          customer_name: string | null
          customer_phone: string | null
          delivery_address: string | null
          delivery_details: string | null
          dest_lat: number | null
          dest_lng: number | null
          distance: string | null
          driver_id: string | null
          driver_lat: number | null
          driver_lng: number | null
          driver_name: string | null
          driver_phone: string | null
          driver_popup_shown: boolean
          driver_popup_state: string | null
          eta: string | null
          extra: Json
          id: string
          order_number: string
          order_type: string
          package_description: string | null
          package_type: string | null
          paxi_bag_type: string | null
          paxi_tracking: string | null
          payment_method: string
          pickup_address: string | null
          pickup_details: string | null
          pickup_lat: number | null
          pickup_lng: number | null
          proof_deleted_at: string | null
          proof_paths: string[]
          receiver_name: string | null
          receiver_phone: string | null
          status: string
          status_times: Json
          type: string
          updated_at: string
        }
        Insert: {
          amount?: number
          assigned_at?: string | null
          brand?: string | null
          client_popup_shown?: boolean
          client_popup_state?: string | null
          completed_at?: string | null
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          delivery_address?: string | null
          delivery_details?: string | null
          dest_lat?: number | null
          dest_lng?: number | null
          distance?: string | null
          driver_id?: string | null
          driver_lat?: number | null
          driver_lng?: number | null
          driver_name?: string | null
          driver_phone?: string | null
          driver_popup_shown?: boolean
          driver_popup_state?: string | null
          eta?: string | null
          extra?: Json
          id?: string
          order_number: string
          order_type?: string
          package_description?: string | null
          package_type?: string | null
          paxi_bag_type?: string | null
          paxi_tracking?: string | null
          payment_method?: string
          pickup_address?: string | null
          pickup_details?: string | null
          pickup_lat?: number | null
          pickup_lng?: number | null
          proof_deleted_at?: string | null
          proof_paths?: string[]
          receiver_name?: string | null
          receiver_phone?: string | null
          status?: string
          status_times?: Json
          type?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          assigned_at?: string | null
          brand?: string | null
          client_popup_shown?: boolean
          client_popup_state?: string | null
          completed_at?: string | null
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          delivery_address?: string | null
          delivery_details?: string | null
          dest_lat?: number | null
          dest_lng?: number | null
          distance?: string | null
          driver_id?: string | null
          driver_lat?: number | null
          driver_lng?: number | null
          driver_name?: string | null
          driver_phone?: string | null
          driver_popup_shown?: boolean
          driver_popup_state?: string | null
          eta?: string | null
          extra?: Json
          id?: string
          order_number?: string
          order_type?: string
          package_description?: string | null
          package_type?: string | null
          paxi_bag_type?: string | null
          paxi_tracking?: string | null
          payment_method?: string
          pickup_address?: string | null
          pickup_details?: string | null
          pickup_lat?: number | null
          pickup_lng?: number | null
          proof_deleted_at?: string | null
          proof_paths?: string[]
          receiver_name?: string | null
          receiver_phone?: string | null
          status?: string
          status_times?: Json
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          full_name: string | null
          id: string
          phone: string | null
          role: string
        }
        Insert: {
          full_name?: string | null
          id: string
          phone?: string | null
          role?: string
        }
        Update: {
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string
        }
        Relationships: []
      }
      refresh_logs: {
        Row: {
          action_type: string
          created_at: string
          id: string
          section: string | null
        }
        Insert: {
          action_type: string
          created_at?: string
          id?: string
          section?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string
          id?: string
          section?: string | null
        }
        Relationships: []
      }
      restaurant_menus: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_available: boolean
          is_new: boolean
          item_name: string
          last_synced_at: string | null
          price: number
          restaurant_name: string
          restaurant_slug: string
          source_url: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean
          is_new?: boolean
          item_name: string
          last_synced_at?: string | null
          price: number
          restaurant_name: string
          restaurant_slug: string
          source_url?: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean
          is_new?: boolean
          item_name?: string
          last_synced_at?: string | null
          price?: number
          restaurant_name?: string
          restaurant_slug?: string
          source_url?: string
          updated_at?: string
        }
        Relationships: []
      }
      restaurants: {
        Row: {
          background_url: string | null
          created_at: string
          delivery_time: string
          description: string | null
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          rating: number
          slug: string
        }
        Insert: {
          background_url?: string | null
          created_at?: string
          delivery_time?: string
          description?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          rating?: number
          slug: string
        }
        Update: {
          background_url?: string | null
          created_at?: string
          delivery_time?: string
          description?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          rating?: number
          slug?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          approved: boolean
          created_at: string
          id: string
          location: string | null
          name: string
          order_number: string | null
          photo_url: string | null
          rating: number
          service: string | null
          text: string
        }
        Insert: {
          approved?: boolean
          created_at?: string
          id?: string
          location?: string | null
          name: string
          order_number?: string | null
          photo_url?: string | null
          rating?: number
          service?: string | null
          text: string
        }
        Update: {
          approved?: boolean
          created_at?: string
          id?: string
          location?: string | null
          name?: string
          order_number?: string | null
          photo_url?: string | null
          rating?: number
          service?: string | null
          text?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      record_ad_click: { Args: { ad_id: string }; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
