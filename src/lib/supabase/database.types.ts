// src/lib/supabase/database.types.ts
// Full strongly-typed schema for the What2Watch Supabase database.
// Generate fresh with: npx supabase gen types typescript --project-id <id> > src/lib/supabase/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      // ── profiles ──────────────────────────────────────────────────────
      profiles: {
        Row: {
          id: string;                  // UUID, matches auth.users.id
          username: string | null;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          role: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          role?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          role?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };

      // ── movies ────────────────────────────────────────────────────────
      movies: {
        Row: {
          id: number;                  // TMDb movie ID
          title: string;
          original_title: string | null;
          overview: string | null;
          release_date: string | null;
          poster_path: string | null;
          backdrop_path: string | null;
          genre_ids: number[] | null;
          vote_average: number | null;
          vote_count: number | null;
          popularity: number | null;
          runtime: number | null;
          tagline: string | null;
          imdb_id: string | null;
          created_at: string;
          updated_at: string;
          custom_editorial_description: string | null;
          emotional_tags: string[] | null;
          context_tags: string[] | null;
          craft_tags: string[] | null;
          festival_tags: string[] | null;
          is_featured: boolean;
          is_homepage_hero: boolean;
          visibility: string;
          status: string;
          trailer_url: string | null;
          streaming_providers: Json | null;
          recommendation_score: number;
        };
        Insert: {
          id: number;
          title: string;
          original_title?: string | null;
          overview?: string | null;
          release_date?: string | null;
          poster_path?: string | null;
          backdrop_path?: string | null;
          genre_ids?: number[] | null;
          vote_average?: number | null;
          vote_count?: number | null;
          popularity?: number | null;
          runtime?: number | null;
          tagline?: string | null;
          imdb_id?: string | null;
          created_at?: string;
          updated_at?: string;
          custom_editorial_description?: string | null;
          emotional_tags?: string[] | null;
          context_tags?: string[] | null;
          craft_tags?: string[] | null;
          festival_tags?: string[] | null;
          is_featured?: boolean;
          is_homepage_hero?: boolean;
          visibility?: string;
          status?: string;
          trailer_url?: string | null;
          streaming_providers?: Json | null;
          recommendation_score?: number;
        };
        Update: {
          title?: string;
          original_title?: string | null;
          overview?: string | null;
          release_date?: string | null;
          poster_path?: string | null;
          backdrop_path?: string | null;
          genre_ids?: number[] | null;
          vote_average?: number | null;
          vote_count?: number | null;
          popularity?: number | null;
          runtime?: number | null;
          tagline?: string | null;
          imdb_id?: string | null;
          updated_at?: string;
          custom_editorial_description?: string | null;
          emotional_tags?: string[] | null;
          context_tags?: string[] | null;
          craft_tags?: string[] | null;
          festival_tags?: string[] | null;
          is_featured?: boolean;
          is_homepage_hero?: boolean;
          visibility?: string;
          status?: string;
          trailer_url?: string | null;
          streaming_providers?: Json | null;
          recommendation_score?: number;
        };
        Relationships: [];
      };

      // ── watchlist ─────────────────────────────────────────────────────
      watchlist: {
        Row: {
          id: string;
          user_id: string;
          movie_id: number;
          status: "want_to_watch" | "watching" | "watched";
          rating: number | null;       // 1–10
          notes: string | null;
          added_at: string;
          watched_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          movie_id: number;
          status?: "want_to_watch" | "watching" | "watched";
          rating?: number | null;
          notes?: string | null;
          added_at?: string;
          watched_at?: string | null;
        };
        Update: {
          status?: "want_to_watch" | "watching" | "watched";
          rating?: number | null;
          notes?: string | null;
          watched_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "watchlist_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "watchlist_movie_id_fkey";
            columns: ["movie_id"];
            referencedRelation: "movies";
            referencedColumns: ["id"];
          },
        ];
      };

      // ── favorites ─────────────────────────────────────────────────────
      favorites: {
        Row: {
          id: string;
          user_id: string;
          movie_id: number;
          added_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          movie_id: number;
          added_at?: string;
        };
        Update: {
          movie_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "favorites_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "favorites_movie_id_fkey";
            columns: ["movie_id"];
            referencedRelation: "movies";
            referencedColumns: ["id"];
          },
        ];
      };

      // ── recommendation_history ────────────────────────────────────────
      recommendation_history: {
        Row: {
          id: string;
          user_id: string;
          movie_id: number;
          source: string;
          reason: string | null;
          score: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          movie_id: number;
          source?: string;
          reason?: string | null;
          score?: number | null;
          created_at?: string;
        };
        Update: {
          reason?: string | null;
          score?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "recommendation_history_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recommendation_history_movie_id_fkey";
            columns: ["movie_id"];
            referencedRelation: "movies";
            referencedColumns: ["id"];
          },
        ];
      };

      // ── user_preferences ──────────────────────────────────────────────
      user_preferences: {
        Row: {
          user_id: string;
          favourite_genre_ids: number[] | null;
          preferred_languages: string[] | null;  // ISO 639-1
          min_rating: number | null;
          max_runtime_mins: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          favourite_genre_ids?: number[] | null;
          preferred_languages?: string[] | null;
          min_rating?: number | null;
          max_runtime_mins?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          favourite_genre_ids?: number[] | null;
          preferred_languages?: string[] | null;
          min_rating?: number | null;
          max_runtime_mins?: number | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };

      // ── guillaume_conversations ───────────────────────────────────────
      guillaume_conversations: {
        Row: {
          id: string;
          user_id: string | null;     // null = anonymous
          messages: Json;             // { role, content }[]
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          messages: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          messages?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
    };

    Views: {
      [_ in never]: never;
    };

    Functions: {
      [_ in never]: never;
    };

    Enums: {
      watchlist_status: "want_to_watch" | "watching" | "watched";
    };

    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
