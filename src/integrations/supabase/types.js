export type Json =
  | string
  | number
  | boolean
  | null
  | { [key] }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      community_posts: {
        Row: {
          category
          content
          created_at
          id
          likes_count
          user_id
        }
        Insert: {
          category?
          content
          created_at?
          id?
          likes_count?
          user_id
        }
        Update: {
          category?
          content?
          created_at?
          id?
          likes_count?
          user_id?
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount
          category
          created_at
          date
          description
          id
          type
          user_id
        }
        Insert: {
          amount
          category
          created_at?
          date?
          description
          id?
          type?
          user_id
        }
        Update: {
          amount?
          category?
          created_at?
          date?
          description?
          id?
          type?
          user_id?
        }
        Relationships: []
      }
      post_likes: {
        Row: {
          created_at
          id
          post_id
          user_id
        }
        Insert: {
          created_at?
          id?
          post_id
          user_id
        }
        Update: {
          created_at?
          id?
          post_id?
          user_id?
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_replies: {
        Row: {
          content
          created_at
          id
          post_id
          user_id
        }
        Insert: {
          content
          created_at?
          id?
          post_id
          user_id
        }
        Update: {
          content?
          created_at?
          id?
          post_id?
          user_id?
        }
        Relationships: [
          {
            foreignKeyName: "post_replies_post_id_fkey"
            columns: ["post_id"]
            isOneToOne
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at
          full_name
          id
          location
          user_id
        }
        Insert: {
          created_at?
          full_name?
          id?
          location?
          user_id
        }
        Update: {
          created_at?
          full_name?
          id?
          location?
          user_id?
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]
    }
    Functions: {
      [_ in never]
    }
    Enums: {
      [_ in never]
    }
    CompositeTypes: {
      [_ in never]
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
     = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row R
    }
    ? R
    
   extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row R
      }
      ? R

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
     = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert I
    }
    ? I
    
   extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert I
      }
      ? I

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
     = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update U
    }
    ? U
    
   extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update U
      }
      ? U

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
     = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
   extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
     = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
   extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]

export const Constants = {
  public: {
    Enums: {},
  },
}