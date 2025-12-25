// Supabase Client for Server Components and Server Actions
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './types'

export async function createClient() {
  const cookieStore = await cookies()

  // 環境変数を直接取得（フォールバックなしで確認）
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // 【デバッグ】Server側クライアント初期化時の環境変数
  console.log('[lib/supabase/server.ts] createClient() called');
  console.log('[lib/supabase/server.ts] NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl || 'UNDEFINED');
  console.log('[lib/supabase/server.ts] URL includes xxxxx:', supabaseUrl?.includes('xxxxx') || false);
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('[lib/supabase/server.ts] ❌ Missing environment variables');
    console.error('[lib/supabase/server.ts] URL:', supabaseUrl);
    console.error('[lib/supabase/server.ts] Key exists:', !!supabaseKey);
    throw new Error('Supabase環境変数が設定されていません');
  }

  return createServerClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// Service role client for admin operations (audit logs, etc.)
export function createServiceClient() {
  // デモモード対応: 環境変数未設定時はダミー値を使用
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-role-key'

  return createServerClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {},
    }
  )
}

