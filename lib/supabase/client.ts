// Supabase Client for Browser
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

export function createClient() {
  // デモモード対応: 環境変数未設定時はダミー値を使用
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
  
  return createBrowserClient<Database>(supabaseUrl, supabaseKey)
}

