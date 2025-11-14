export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type DietaryAttribute = 
  | 'vegetarian' 
  | 'vegan' 
  | 'gluten_free' 
  | 'lactose_free' 
  | 'spicy' 
  | 'organic' 
  | 'halal' 
  | 'kosher';

export type ItemStatus = 'available' | 'unavailable' | 'seasonal';

export interface Database {
  public: {
    Tables: {
      restaurant_settings: {
        Row: {
          id: string
          restaurant_name: string
          tagline: string | null
          description: string | null
          address_street: string | null
          address_number: string | null
          address_complement: string | null
          address_city: string | null
          address_state: string | null
          address_country: string | null
          address_postal_code: string | null
          phone: string | null
          whatsapp: string | null
          email: string | null
          instagram_url: string | null
          facebook_url: string | null
          tripadvisor_url: string | null
          website_url: string | null
          reservation_url: string | null
          business_hours: Json | null
          logo_url: string | null
          cover_image_url: string | null
          primary_color: string
          secondary_color: string
          accent_color: string
          font_headings: string
          font_body: string
          default_language: string
          active_languages: string[]
          show_prices: boolean
          show_images: boolean
          menu_density: string
          default_sorting: string
          meta_title: string | null
          meta_description: string | null
          meta_keywords: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['restaurant_settings']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['restaurant_settings']['Insert']>
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          icon: string | null
          image_url: string | null
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['categories']['Insert']>
      }
      menu_items: {
        Row: {
          id: string
          category_id: string
          name: string
          description: string | null
          price: number
          image_url: string | null
          images: Json | null
          dietary_attributes: DietaryAttribute[] | null
          allergens: string[] | null
          preparation_time: number | null
          calories: number | null
          portion_size: string | null
          status: ItemStatus
          is_featured: boolean
          display_order: number
          views_count: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['menu_items']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['menu_items']['Insert']>
      }
      translations: {
        Row: {
          id: string
          entity_type: 'category' | 'menu_item' | 'restaurant_settings'
          entity_id: string
          field_name: 'name' | 'description' | 'tagline'
          language: string
          translated_text: string
          is_auto_translated: boolean
          translation_quality: number | null
          translation_service: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['translations']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['translations']['Insert']>
      }
    }
    Views: {
      menu_complete: {
        Row: {
          category_id: string
          category_name: string
          category_slug: string
          category_order: number
          category_active: boolean
          item_id: string | null
          item_name: string | null
          item_description: string | null
          price: number | null
          image_url: string | null
          images: Json | null
          dietary_attributes: DietaryAttribute[] | null
          allergens: string[] | null
          status: ItemStatus | null
          is_featured: boolean | null
          item_order: number | null
          views_count: number | null
        }
      }
    }
    Functions: {
      increment_item_views: {
        Args: { item_uuid: string }
        Returns: void
      }
      search_menu_items: {
        Args: { 
          search_term: string
          search_language?: string 
        }
        Returns: {
          item_id: string
          item_name: string
          item_description: string
          category_name: string
          price: number
          relevance: number
        }[]
      }
    }
  }
}
