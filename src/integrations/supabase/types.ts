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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      action_items: {
        Row: {
          created_at: string
          created_by: string | null
          due_date: string | null
          id: string
          owner_name: string | null
          priority: Database["public"]["Enums"]["priority_level"]
          project_id: string
          source_id: string | null
          source_label: string | null
          status: Database["public"]["Enums"]["action_status"]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          id?: string
          owner_name?: string | null
          priority?: Database["public"]["Enums"]["priority_level"]
          project_id: string
          source_id?: string | null
          source_label?: string | null
          status?: Database["public"]["Enums"]["action_status"]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          id?: string
          owner_name?: string | null
          priority?: Database["public"]["Enums"]["priority_level"]
          project_id?: string
          source_id?: string | null
          source_label?: string | null
          status?: Database["public"]["Enums"]["action_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "action_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_items_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      artifacts: {
        Row: {
          body: string | null
          created_at: string
          created_by: string | null
          creator_name: string | null
          id: string
          kind: Database["public"]["Enums"]["artifact_kind"]
          project_id: string
          title: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          created_by?: string | null
          creator_name?: string | null
          id?: string
          kind: Database["public"]["Enums"]["artifact_kind"]
          project_id: string
          title: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          created_at?: string
          created_by?: string | null
          creator_name?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["artifact_kind"]
          project_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "artifacts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          citations: Json | null
          content: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["chat_role"]
          thread_id: string
        }
        Insert: {
          citations?: Json | null
          content: string
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["chat_role"]
          thread_id: string
        }
        Update: {
          citations?: Json | null
          content?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["chat_role"]
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "chat_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_threads: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          project_id: string
          title: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          project_id: string
          title?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          project_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_threads_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          attendees: Json | null
          created_at: string
          id: string
          occurred_at: string | null
          project_id: string
          source_id: string | null
          title: string
        }
        Insert: {
          attendees?: Json | null
          created_at?: string
          id?: string
          occurred_at?: string | null
          project_id: string
          source_id?: string | null
          title: string
        }
        Update: {
          attendees?: Json | null
          created_at?: string
          id?: string
          occurred_at?: string | null
          project_id?: string
          source_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "meetings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      memory_items: {
        Row: {
          body: string | null
          created_at: string
          created_by: string | null
          id: string
          occurred_on: string | null
          owner_name: string | null
          priority: Database["public"]["Enums"]["priority_level"] | null
          project_id: string
          source_id: string | null
          source_label: string | null
          title: string
          type: Database["public"]["Enums"]["memory_type"]
          updated_at: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          occurred_on?: string | null
          owner_name?: string | null
          priority?: Database["public"]["Enums"]["priority_level"] | null
          project_id: string
          source_id?: string | null
          source_label?: string | null
          title: string
          type: Database["public"]["Enums"]["memory_type"]
          updated_at?: string
        }
        Update: {
          body?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          occurred_on?: string | null
          owner_name?: string | null
          priority?: Database["public"]["Enums"]["priority_level"] | null
          project_id?: string
          source_id?: string | null
          source_label?: string | null
          title?: string
          type?: Database["public"]["Enums"]["memory_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "memory_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memory_items_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          timezone: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          timezone?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          timezone?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          client: string | null
          created_at: string
          created_by: string | null
          due_date: string | null
          health: Database["public"]["Enums"]["project_health"]
          id: string
          name: string
          owner_name: string | null
          progress: number
          status: Database["public"]["Enums"]["project_status"]
          summary: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          client?: string | null
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          health?: Database["public"]["Enums"]["project_health"]
          id?: string
          name: string
          owner_name?: string | null
          progress?: number
          status?: Database["public"]["Enums"]["project_status"]
          summary?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          client?: string | null
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          health?: Database["public"]["Enums"]["project_health"]
          id?: string
          name?: string
          owner_name?: string | null
          progress?: number
          status?: Database["public"]["Enums"]["project_status"]
          summary?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      source_chunks: {
        Row: {
          content: string
          created_at: string
          id: string
          idx: number
          source_id: string
          token_count: number | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          idx: number
          source_id: string
          token_count?: number | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          idx?: number
          source_id?: string
          token_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "source_chunks_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      sources: {
        Row: {
          bytes: number | null
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["source_kind"]
          mime: string | null
          project_id: string
          status: Database["public"]["Enums"]["source_status"]
          storage_path: string | null
          title: string
          updated_at: string
          uploaded_by: string | null
          uploader_name: string | null
        }
        Insert: {
          bytes?: number | null
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["source_kind"]
          mime?: string | null
          project_id: string
          status?: Database["public"]["Enums"]["source_status"]
          storage_path?: string | null
          title: string
          updated_at?: string
          uploaded_by?: string | null
          uploader_name?: string | null
        }
        Update: {
          bytes?: number | null
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["source_kind"]
          mime?: string | null
          project_id?: string
          status?: Database["public"]["Enums"]["source_status"]
          storage_path?: string | null
          title?: string
          updated_at?: string
          uploaded_by?: string | null
          uploader_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sources_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      workspace_members: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["workspace_role"]
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["workspace_role"]
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["workspace_role"]
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string
          id: string
          name: string
          plan: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          plan?: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          plan?: string
          slug?: string
          updated_at?: string
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
      is_workspace_member: {
        Args: { _user_id: string; _workspace_id: string }
        Returns: boolean
      }
      project_workspace: { Args: { _project_id: string }; Returns: string }
    }
    Enums: {
      action_status: "open" | "in_progress" | "done" | "blocked"
      app_role: "admin" | "member"
      artifact_kind:
        | "exec_brief"
        | "meeting_summary"
        | "prd"
        | "sop"
        | "project_plan"
        | "followup_email"
        | "meeting_prep"
      chat_role: "user" | "assistant" | "system"
      memory_type:
        | "decision"
        | "risk"
        | "action"
        | "question"
        | "stakeholder"
        | "summary"
      priority_level: "low" | "med" | "high"
      project_health: "on_track" | "at_risk" | "off_track"
      project_status: "active" | "on_hold" | "archived"
      source_kind: "file" | "transcript" | "audio" | "video" | "note" | "url"
      source_status: "uploaded" | "processing" | "processed" | "failed"
      workspace_role: "owner" | "admin" | "member" | "viewer"
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
      action_status: ["open", "in_progress", "done", "blocked"],
      app_role: ["admin", "member"],
      artifact_kind: [
        "exec_brief",
        "meeting_summary",
        "prd",
        "sop",
        "project_plan",
        "followup_email",
        "meeting_prep",
      ],
      chat_role: ["user", "assistant", "system"],
      memory_type: [
        "decision",
        "risk",
        "action",
        "question",
        "stakeholder",
        "summary",
      ],
      priority_level: ["low", "med", "high"],
      project_health: ["on_track", "at_risk", "off_track"],
      project_status: ["active", "on_hold", "archived"],
      source_kind: ["file", "transcript", "audio", "video", "note", "url"],
      source_status: ["uploaded", "processing", "processed", "failed"],
      workspace_role: ["owner", "admin", "member", "viewer"],
    },
  },
} as const
