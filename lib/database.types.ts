export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: "admin" | "student";
          name: string;
          grade: string | null;
          avatar_initials: string | null;
          avatar_color: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          role: "admin" | "student";
          name: string;
          grade?: string | null;
          avatar_initials?: string | null;
          avatar_color?: string | null;
          created_at?: string;
        };
        Update: {
          role?: "admin" | "student";
          name?: string;
          grade?: string | null;
          avatar_initials?: string | null;
          avatar_color?: string | null;
        };
      };
      study_packs: {
        Row: {
          id: string;
          created_by: string | null;
          title: string;
          subject: string;
          grade: string;
          exam_name: string;
          exam_date: string;
          status: "draft" | "in_review" | "published" | "archived";
          topics_count: number;
          questions_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          created_by?: string | null;
          title: string;
          subject: string;
          grade: string;
          exam_name: string;
          exam_date: string;
          status?: "draft" | "in_review" | "published" | "archived";
          topics_count?: number;
          questions_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          subject?: string;
          grade?: string;
          exam_name?: string;
          exam_date?: string;
          status?: "draft" | "in_review" | "published" | "archived";
          topics_count?: number;
          questions_count?: number;
          updated_at?: string;
        };
      };
      student_packs: {
        Row: {
          student_id: string;
          pack_id: string;
          assigned_at: string;
        };
        Insert: {
          student_id: string;
          pack_id: string;
          assigned_at?: string;
        };
        Update: Record<string, never>;
      };
      topics: {
        Row: {
          id: string;
          pack_id: string;
          title: string;
          summary: string | null;
          order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          pack_id: string;
          title: string;
          summary?: string | null;
          order?: number;
          created_at?: string;
        };
        Update: {
          title?: string;
          summary?: string | null;
          order?: number;
        };
      };
      sections: {
        Row: {
          id: string;
          topic_id: string;
          type: "explanation" | "example" | "summary" | "note" | "common_mistake";
          title: string | null;
          content: string;
          order: number;
        };
        Insert: {
          id?: string;
          topic_id: string;
          type: "explanation" | "example" | "summary" | "note" | "common_mistake";
          title?: string | null;
          content: string;
          order?: number;
        };
        Update: {
          type?: "explanation" | "example" | "summary" | "note" | "common_mistake";
          title?: string | null;
          content?: string;
          order?: number;
        };
      };
      exercises: {
        Row: {
          id: string;
          topic_id: string;
          type: "multiple_choice" | "true_false" | "fill_blank" | "open_short" | "numeric"
              | "multiple_select" | "open_long" | "match_columns" | "ordering"
              | "text_interpretation" | "explain_required" | "text_production";
          statement: string;
          choices: Json | null;
          correct_answer: string;
          explanation: string;
          order: number;
          passage: string | null;
          left_items: Json | null;
        };
        Insert: {
          id?: string;
          topic_id: string;
          type: "multiple_choice" | "true_false" | "fill_blank" | "open_short" | "numeric"
              | "multiple_select" | "open_long" | "match_columns" | "ordering"
              | "text_interpretation" | "explain_required" | "text_production";
          statement: string;
          choices?: Json | null;
          correct_answer: string;
          explanation: string;
          order?: number;
          passage?: string | null;
          left_items?: Json | null;
        };
        Update: {
          type?: "multiple_choice" | "true_false" | "fill_blank" | "open_short" | "numeric"
               | "multiple_select" | "open_long" | "match_columns" | "ordering"
               | "text_interpretation" | "explain_required" | "text_production";
          statement?: string;
          choices?: Json | null;
          correct_answer?: string;
          explanation?: string;
          order?: number;
          passage?: string | null;
          left_items?: Json | null;
        };
      };
      groups: {
        Row: {
          id: string;
          created_by: string | null;
          name: string;
          description: string | null;
          type: "family" | "school" | "classroom" | "tutoring_group" | "subject_group" | "custom";
          school_name: string | null;
          grade: string | null;
          subject: string | null;
          tags: string[];
          status: "active" | "inactive";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          created_by?: string | null;
          name: string;
          description?: string | null;
          type?: "family" | "school" | "classroom" | "tutoring_group" | "subject_group" | "custom";
          school_name?: string | null;
          grade?: string | null;
          subject?: string | null;
          tags?: string[];
          status?: "active" | "inactive";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          type?: "family" | "school" | "classroom" | "tutoring_group" | "subject_group" | "custom";
          school_name?: string | null;
          grade?: string | null;
          subject?: string | null;
          tags?: string[];
          status?: "active" | "inactive";
          updated_at?: string;
        };
      };
      group_admins: {
        Row: { group_id: string; admin_id: string; added_at: string };
        Insert: { group_id: string; admin_id: string; added_at?: string };
        Update: { added_at?: string };
      };
      group_members: {
        Row: { group_id: string; student_id: string; status: "active" | "inactive"; joined_at: string };
        Insert: { group_id: string; student_id: string; status?: "active" | "inactive"; joined_at?: string };
        Update: { status?: "active" | "inactive" };
      };
      invitations: {
        Row: {
          id: string;
          token: string;
          group_id: string;
          created_by: string | null;
          email: string | null;
          student_name: string | null;
          status: "pending" | "accepted" | "expired" | "revoked";
          accepted_by: string | null;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          token?: string;
          group_id: string;
          created_by?: string | null;
          email?: string | null;
          student_name?: string | null;
          status?: "pending" | "accepted" | "expired" | "revoked";
          accepted_by?: string | null;
          expires_at?: string;
          created_at?: string;
        };
        Update: {
          status?: "pending" | "accepted" | "expired" | "revoked";
          accepted_by?: string | null;
        };
      };
      group_assignments: {
        Row: { group_id: string; pack_id: string; assigned_by: string | null; assigned_at: string };
        Insert: { group_id: string; pack_id: string; assigned_by?: string | null; assigned_at?: string };
        Update: { assigned_by?: string | null };
      };
      topic_progress: {
        Row: {
          id: string;
          student_id: string;
          topic_id: string;
          score: number;
          correct_answers: number;
          total_questions: number;
          attempts: number;
          last_attempt_at: string | null;
        };
        Insert: {
          id?: string;
          student_id: string;
          topic_id: string;
          score?: number;
          correct_answers?: number;
          total_questions?: number;
          attempts?: number;
          last_attempt_at?: string | null;
        };
        Update: {
          score?: number;
          correct_answers?: number;
          total_questions?: number;
          attempts?: number;
          last_attempt_at?: string | null;
        };
      };
      exercise_responses: {
        Row: {
          id: string;
          student_id: string;
          exercise_id: string;
          attempt_number: number;
          user_answer: string | null;
          is_correct: boolean | null;
          was_revealed: boolean;
          answered_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          exercise_id: string;
          attempt_number?: number;
          user_answer?: string | null;
          is_correct?: boolean | null;
          was_revealed?: boolean;
          answered_at?: string;
        };
        Update: {
          user_answer?: string | null;
          is_correct?: boolean | null;
          was_revealed?: boolean;
        };
      };
      source_files: {
        Row: {
          id: string;
          pack_id: string;
          file_name: string;
          file_size: number | null;
          storage_path: string;
          processing_status: "pending" | "processing" | "done" | "error";
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          pack_id: string;
          file_name: string;
          file_size?: number | null;
          storage_path: string;
          processing_status?: "pending" | "processing" | "done" | "error";
          uploaded_at?: string;
        };
        Update: {
          processing_status?: "pending" | "processing" | "done" | "error";
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

// Convenience row types
type Tables = Database["public"]["Tables"];
export type ProfileRow = Tables["profiles"]["Row"];
export type StudyPackRow = Tables["study_packs"]["Row"];
export type StudentPackRow = Tables["student_packs"]["Row"];
export type TopicRow = Tables["topics"]["Row"];
export type SectionRow = Tables["sections"]["Row"];
export type ExerciseRow = Tables["exercises"]["Row"];
export type TopicProgressRow = Tables["topic_progress"]["Row"];
export type ExerciseResponseRow = Tables["exercise_responses"]["Row"];
export type SourceFileRow = Tables["source_files"]["Row"];
export type GroupRow = Tables["groups"]["Row"];
export type GroupMemberRow = Tables["group_members"]["Row"];
export type GroupAdminRow = Tables["group_admins"]["Row"];
export type InvitationRow = Tables["invitations"]["Row"];
export type GroupAssignmentRow = Tables["group_assignments"]["Row"];
