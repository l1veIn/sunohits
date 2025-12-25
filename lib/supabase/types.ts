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
          cid: string | null
          title: string
          pic: string | null
          owner_name: string | null
          pubdate: number | null
          total_view: number | null
        }
        Insert: {
          bvid: string
          cid?: string | null
          title: string
          pic?: string | null
          owner_name?: string | null
          pubdate?: number | null
          total_view?: number | null
        }
        Update: {
          bvid?: string
          cid?: string | null
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
      charts: {
        Row: {
          id: string
          name: string
          description: string | null
          order_by: string
          duration_filter: number
          time_range: string
          last_crawled_at: string | null
        }
        Insert: {
          id: string
          name: string
          description?: string | null
          order_by?: string
          duration_filter?: number
          time_range?: string
          last_crawled_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          order_by?: string
          duration_filter?: number
          time_range?: string
          last_crawled_at?: string | null
        }
      }
      chart_songs: {
        Row: {
          chart_id: string
          bvid: string
          rank: number
          crawled_at: string
        }
        Insert: {
          chart_id: string
          bvid: string
          rank: number
          crawled_at?: string
        }
        Update: {
          chart_id?: string
          bvid?: string
          rank?: number
          crawled_at?: string
        }
      }
    }
    Views: {
      daily_trending_songs: {
        Row: {
          bvid: string
          cid: string | null
          title: string
          pic: string | null
          owner_name: string | null
          pubdate: number | null
          total_view: number | null
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