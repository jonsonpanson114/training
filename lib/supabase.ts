import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Build-time protection: Only create client if environment variables are present
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any;

if (!supabase) {
  console.warn('Supabase environment variables are missing. Database features will not work.');
}

// Database types
export type Database = {
  public: {
    Tables: {
      prompts: {
        Row: {
          id: string;
          category: string;
          type: string;
          title: string;
          description: string;
          time_limit: number;
          order: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          category: string;
          type: string;
          title: string;
          description: string;
          time_limit: number;
          order?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          category?: string;
          type?: string;
          title?: string;
          description?: string;
          time_limit?: number;
          order?: number | null;
          created_at?: string;
        };
      };
      entries: {
        Row: {
          id: string;
          user_id: string;
          prompt_id: string | null;
          category: string;
          content: string;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          prompt_id?: string | null;
          category: string;
          content: string;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          prompt_id?: string | null;
          category?: string;
          content?: string;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      abduction_entries: {
        Row: {
          id: string;
          entry_id: string;
          observations: string[];
          hypotheses: { hypothesis: string; reasoning: string }[];
          scores: { logic: number; creativity: number; persuasiveness: number; total: number } | null;
          feedback: string | null;
        };
        Insert: {
          id?: string;
          entry_id: string;
          observations: string[];
          hypotheses: { hypothesis: string; reasoning: string }[];
          scores?: { logic: number; creativity: number; persuasiveness: number; total: number } | null;
          feedback?: string | null;
        };
        Update: {
          id?: string;
          entry_id?: string;
          observations?: string[];
          hypotheses?: { hypothesis: string; reasoning: string }[];
          scores?: { logic: number; creativity: number; persuasiveness: number; total: number } | null;
          feedback?: string | null;
        };
      };
      synapse_entries: {
        Row: {
          id: string;
          entry_id: string;
          word1: string;
          word2: string;
          connections: string[];
          score: number | null;
          feedback: string | null;
        };
        Insert: {
          id?: string;
          entry_id: string;
          word1: string;
          word2: string;
          connections: string[];
          score?: number | null;
          feedback?: string | null;
        };
        Update: {
          id?: string;
          entry_id?: string;
          word1?: string;
          word2?: string;
          connections?: string[];
          score?: number | null;
          feedback?: string | null;
        };
      };
    };
  };
};
