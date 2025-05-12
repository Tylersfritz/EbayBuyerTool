export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      arbitrage_opportunities: {
        Row: {
          created_at: string
          id: string
          price_difference: number
          profit_margin: number
          source_item_id: string
          source_item_title: string
          source_item_url: string
          source_listing_data: Json | null
          source_marketplace: string
          source_price: number
          status: string
          target_listing_data: Json | null
          target_marketplace: string
          target_price: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          price_difference: number
          profit_margin: number
          source_item_id: string
          source_item_title: string
          source_item_url: string
          source_listing_data?: Json | null
          source_marketplace: string
          source_price: number
          status?: string
          target_listing_data?: Json | null
          target_marketplace: string
          target_price: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          price_difference?: number
          profit_margin?: number
          source_item_id?: string
          source_item_title?: string
          source_item_url?: string
          source_listing_data?: Json | null
          source_marketplace?: string
          source_price?: number
          status?: string
          target_listing_data?: Json | null
          target_marketplace?: string
          target_price?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      auction_snipes: {
        Row: {
          auction_end_time: string
          created_at: string
          current_price: number
          id: string
          item_id: string
          item_title: string
          item_url: string
          marketplace: string
          marketplace_metadata: Json | null
          max_bid_amount: number
          snipe_time: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auction_end_time: string
          created_at?: string
          current_price: number
          id?: string
          item_id: string
          item_title: string
          item_url: string
          marketplace: string
          marketplace_metadata?: Json | null
          max_bid_amount: number
          snipe_time: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auction_end_time?: string
          created_at?: string
          current_price?: number
          id?: string
          item_id?: string
          item_title?: string
          item_url?: string
          marketplace?: string
          marketplace_metadata?: Json | null
          max_bid_amount?: number
          snipe_time?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      price_check_logs: {
        Row: {
          created_at: string | null
          id: string
          item_id: string | null
          item_price: number | null
          item_title: string
          month_key: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id?: string | null
          item_price?: number | null
          item_title: string
          month_key: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string | null
          item_price?: number | null
          item_title?: string
          month_key?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          id: string
          subscription_end: string | null
          subscription_start: string | null
          subscription_status: string
          subscription_tier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          subscription_end?: string | null
          subscription_start?: string | null
          subscription_status?: string
          subscription_tier?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          subscription_end?: string | null
          subscription_start?: string | null
          subscription_status?: string
          subscription_tier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      visual_scanner_logs: {
        Row: {
          created_at: string
          id: string
          month_key: string | null
          scan_date: string
          scan_result: Json | null
          scan_type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          month_key?: string | null
          scan_date?: string
          scan_result?: Json | null
          scan_type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          month_key?: string | null
          scan_date?: string
          scan_result?: Json | null
          scan_type?: string | null
          user_id?: string
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
