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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      cms_content: {
        Row: {
          description: string | null
          id: string
          is_locked: boolean
          key: string
          label: string
          section: string
          type: string
          updated_at: string
          updated_by: string | null
          value: string
        }
        Insert: {
          description?: string | null
          id?: string
          is_locked?: boolean
          key: string
          label?: string
          section?: string
          type?: string
          updated_at?: string
          updated_by?: string | null
          value?: string
        }
        Update: {
          description?: string | null
          id?: string
          is_locked?: boolean
          key?: string
          label?: string
          section?: string
          type?: string
          updated_at?: string
          updated_by?: string | null
          value?: string
        }
        Relationships: []
      }
      cms_content_history: {
        Row: {
          changed_at: string
          changed_by: string | null
          changed_by_email: string | null
          content_id: string
          id: string
          key: string
          new_value: string
          old_value: string
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          changed_by_email?: string | null
          content_id: string
          id?: string
          key: string
          new_value?: string
          old_value?: string
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          changed_by_email?: string | null
          content_id?: string
          id?: string
          key?: string
          new_value?: string
          old_value?: string
        }
        Relationships: [
          {
            foreignKeyName: "cms_content_history_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "cms_content"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          created_at: string
          district: string | null
          email: string | null
          id: string
          message: string
          name: string
          phone: string | null
          status: string
        }
        Insert: {
          created_at?: string
          district?: string | null
          email?: string | null
          id?: string
          message?: string
          name?: string
          phone?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          district?: string | null
          email?: string | null
          id?: string
          message?: string
          name?: string
          phone?: string | null
          status?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          category: string
          created_at: string
          file_size: number | null
          file_url: string
          id: string
          is_public: boolean
          title_en: string
          title_hi: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          file_size?: number | null
          file_url?: string
          id?: string
          is_public?: boolean
          title_en?: string
          title_hi?: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          file_size?: number | null
          file_url?: string
          id?: string
          is_public?: boolean
          title_en?: string
          title_hi?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          language: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          language?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          language?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          cover_image: string | null
          created_at: string
          description_en: string
          description_hi: string
          event_date: string | null
          event_time: string | null
          id: string
          location_en: string | null
          location_hi: string | null
          slug: string | null
          status: Database["public"]["Enums"]["content_status"]
          title_en: string
          title_hi: string
          updated_at: string
        }
        Insert: {
          cover_image?: string | null
          created_at?: string
          description_en?: string
          description_hi?: string
          event_date?: string | null
          event_time?: string | null
          id?: string
          location_en?: string | null
          location_hi?: string | null
          slug?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          title_en?: string
          title_hi?: string
          updated_at?: string
        }
        Update: {
          cover_image?: string | null
          created_at?: string
          description_en?: string
          description_hi?: string
          event_date?: string | null
          event_time?: string | null
          id?: string
          location_en?: string | null
          location_hi?: string | null
          slug?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          title_en?: string
          title_hi?: string
          updated_at?: string
        }
        Relationships: []
      }
      event_photos: {
        Row: {
          caption: string | null
          created_at: string
          event_id: string
          id: string
          photo_url: string
          sort_order: number
        }
        Insert: {
          caption?: string | null
          created_at?: string
          event_id: string
          id?: string
          photo_url: string
          sort_order?: number
        }
        Update: {
          caption?: string | null
          created_at?: string
          event_id?: string
          id?: string
          photo_url?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "event_photos_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_rsvps: {
        Row: {
          attendees_count: number
          created_at: string
          district: string | null
          event_id: string
          id: string
          name: string
          phone: string
        }
        Insert: {
          attendees_count?: number
          created_at?: string
          district?: string | null
          event_id: string
          id?: string
          name: string
          phone: string
        }
        Update: {
          attendees_count?: number
          created_at?: string
          district?: string | null
          event_id?: string
          id?: string
          name?: string
          phone?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      leadership_profiles: {
        Row: {
          bio_en: string
          bio_hi: string
          created_at: string
          designation_en: string
          designation_hi: string
          display_order: number
          id: string
          is_active: boolean
          name_en: string
          name_hi: string
          photo_url: string | null
          updated_at: string
        }
        Insert: {
          bio_en?: string
          bio_hi?: string
          created_at?: string
          designation_en?: string
          designation_hi?: string
          display_order?: number
          id?: string
          is_active?: boolean
          name_en?: string
          name_hi?: string
          photo_url?: string | null
          updated_at?: string
        }
        Update: {
          bio_en?: string
          bio_hi?: string
          created_at?: string
          designation_en?: string
          designation_hi?: string
          display_order?: number
          id?: string
          is_active?: boolean
          name_en?: string
          name_hi?: string
          photo_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      membership_applications: {
        Row: {
          created_at: string
          district: string
          email: string | null
          full_name: string
          id: string
          message: string | null
          phone: string
          status: string
        }
        Insert: {
          created_at?: string
          district?: string
          email?: string | null
          full_name?: string
          id?: string
          message?: string | null
          phone?: string
          status?: string
        }
        Update: {
          created_at?: string
          district?: string
          email?: string | null
          full_name?: string
          id?: string
          message?: string | null
          phone?: string
          status?: string
        }
        Relationships: []
      }
      news_articles: {
        Row: {
          author_id: string | null
          body_en: string
          body_hi: string
          category: string
          created_at: string
          excerpt_en: string
          excerpt_hi: string
          featured_image: string | null
          id: string
          meta_description_en: string | null
          meta_description_hi: string | null
          meta_title_en: string | null
          meta_title_hi: string | null
          published_at: string | null
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          title_en: string
          title_hi: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          body_en?: string
          body_hi?: string
          category?: string
          created_at?: string
          excerpt_en?: string
          excerpt_hi?: string
          featured_image?: string | null
          id?: string
          meta_description_en?: string | null
          meta_description_hi?: string | null
          meta_title_en?: string | null
          meta_title_hi?: string | null
          published_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          title_en?: string
          title_hi?: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          body_en?: string
          body_hi?: string
          category?: string
          created_at?: string
          excerpt_en?: string
          excerpt_hi?: string
          featured_image?: string | null
          id?: string
          meta_description_en?: string | null
          meta_description_hi?: string | null
          meta_title_en?: string | null
          meta_title_hi?: string | null
          published_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          title_en?: string
          title_hi?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_votes: {
        Row: {
          created_at: string
          id: string
          option_id: string
          poll_id: string
          voter_fingerprint: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          option_id: string
          poll_id: string
          voter_fingerprint?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          option_id?: string
          poll_id?: string
          voter_fingerprint?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      polls: {
        Row: {
          created_at: string
          id: string
          options: Json
          question_en: string
          question_hi: string | null
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          options?: Json
          question_en?: string
          question_hi?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          options?: Json
          question_en?: string
          question_hi?: string | null
          status?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "editor" | "viewer"
      content_status: "draft" | "published" | "archived"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "editor", "viewer"],
      content_status: ["draft", "published", "archived"],
    },
  },
} as const
