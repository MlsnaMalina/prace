// Generováno přes Supabase MCP (generate_typescript_types) z projektu "Recepty" (mjeqymqobpijsskcyjor),
// který teď hostuje i tabulku nabidky. Po každé změně migrace je potřeba přegenerovat.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      _healthcheck: {
        Row: {
          id: string
          pinged_at: string
        }
        Insert: {
          id: string
          pinged_at?: string
        }
        Update: {
          id?: string
          pinged_at?: string
        }
        Relationships: []
      }
      cook_events: {
        Row: {
          cooked_on: string
          created_at: string
          id: string
          recipe_id: string
          user_id: string
        }
        Insert: {
          cooked_on?: string
          created_at?: string
          id?: string
          recipe_id: string
          user_id?: string
        }
        Update: {
          cooked_on?: string
          created_at?: string
          id?: string
          recipe_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cook_events_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      nabidky: {
        Row: {
          adresa: string | null
          datum_reakce: string | null
          firma: string
          hodnoceni: Json
          home_office_dny: number | null
          id: string
          inzerat_uryvek: string | null
          lokalita: string | null
          nalezeno_dne: string
          plat_do: number | null
          plat_od: number | null
          plat_uveden: boolean
          pozice: string
          poznamka: string | null
          pracovni_cesty: string
          pruzna_doba: boolean | null
          skore: number
          stav: string
          stitky: string[] | null
          upraveno: string
          url: string
          vytvoreno: string
          zdroj: string | null
          zpusob_reakce: string | null
        }
        Insert: {
          adresa?: string | null
          datum_reakce?: string | null
          firma: string
          hodnoceni: Json
          home_office_dny?: number | null
          id?: string
          inzerat_uryvek?: string | null
          lokalita?: string | null
          nalezeno_dne: string
          plat_do?: number | null
          plat_od?: number | null
          plat_uveden?: boolean
          pozice: string
          poznamka?: string | null
          pracovni_cesty?: string
          pruzna_doba?: boolean | null
          skore: number
          stav?: string
          stitky?: string[] | null
          upraveno?: string
          url: string
          vytvoreno?: string
          zdroj?: string | null
          zpusob_reakce?: string | null
        }
        Update: {
          adresa?: string | null
          datum_reakce?: string | null
          firma?: string
          hodnoceni?: Json
          home_office_dny?: number | null
          id?: string
          inzerat_uryvek?: string | null
          lokalita?: string | null
          nalezeno_dne?: string
          plat_do?: number | null
          plat_od?: number | null
          plat_uveden?: boolean
          pozice?: string
          poznamka?: string | null
          pracovni_cesty?: string
          pruzna_doba?: boolean | null
          skore?: number
          stav?: string
          stitky?: string[] | null
          upraveno?: string
          url?: string
          vytvoreno?: string
          zdroj?: string | null
          zpusob_reakce?: string | null
        }
        Relationships: []
      }
      recipe_notes: {
        Row: {
          created_at: string
          id: string
          recipe_id: string
          text: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          recipe_id: string
          text: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          recipe_id?: string
          text?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_notes_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          category: string
          created_at: string
          id: string
          image_path: string | null
          ingredients: Json
          is_primary_variant: boolean
          last_cooked: string | null
          rating: number | null
          servings: number
          source: string | null
          steps: Json
          time_minutes: number | null
          title: string
          updated_at: string
          user_id: string
          variant_group_id: string | null
          variant_name: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          image_path?: string | null
          ingredients?: Json
          is_primary_variant?: boolean
          last_cooked?: string | null
          rating?: number | null
          servings?: number
          source?: string | null
          steps?: Json
          time_minutes?: number | null
          title: string
          updated_at?: string
          user_id?: string
          variant_group_id?: string | null
          variant_name?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          image_path?: string | null
          ingredients?: Json
          is_primary_variant?: boolean
          last_cooked?: string | null
          rating?: number | null
          servings?: number
          source?: string | null
          steps?: Json
          time_minutes?: number | null
          title?: string
          updated_at?: string
          user_id?: string
          variant_group_id?: string | null
          variant_name?: string | null
        }
        Relationships: []
      }
      shopping_items: {
        Row: {
          checked: boolean
          created_at: string
          id: string
          name: string
          qty: number | null
          unit: string
          user_id: string
        }
        Insert: {
          checked?: boolean
          created_at?: string
          id?: string
          name: string
          qty?: number | null
          unit?: string
          user_id?: string
        }
        Update: {
          checked?: boolean
          created_at?: string
          id?: string
          name?: string
          qty?: number | null
          unit?: string
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
