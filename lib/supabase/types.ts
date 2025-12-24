export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      songs: {
        Row: {
          bvid: string
          title: string
          pic: string | null
          owner_name: string | null
          pubdate: number | null
          total_view: number | null
        }
        Insert: {
          bvid: string
          title: string
          pic?: string | null
          owner_name?: string | null
          pubdate?: number | null
          total_view?: number | null
        }
        Update: {
          bvid?: string
          title?: string
          pic?: string | null
          owner_name?: string | null
          pubdate?: number | null
          total_view?: number | null
        }
      }
      daily_stats: {
        Row: {
          id: string
          bvid: string
          recorded_at: string
          view_count: number
        }
        Insert: {
          id?: string
          bvid: string
          recorded_at?: string
          view_count: number
        }
        Update: {
          id?: string
          bvid?: string
          recorded_at?: string
          view_count?: number
        }
      }
      crawl_metadata: {
        Row: {
          id: number
          last_run_at: string | null
          status: 'success' | 'fail' | 'running' | null
          processed_pages: string | null
          last_error_message: string | null
        }
        Insert: {
          id?: number
          last_run_at?: string | null
          status?: 'success' | 'fail' | 'running' | null
          processed_pages?: string | null
          last_error_message?: string | null
        }
        Update: {
          id?: number
          last_run_at?: string | null
          status?: 'success' | 'fail' | 'running' | null
          processed_pages?: string | null
          last_error_message?: string | null
        }
      }
    }
    Views: {
      daily_trending_songs: {
        Row: {
          bvid: string
          title: string
          pic: string | null
          owner_name: string | null
          trending_val: number | null
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}