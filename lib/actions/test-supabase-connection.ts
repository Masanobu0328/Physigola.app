"use server";

/**
 * Supabase接続テスト用の最小Server Action
 * 目的: Supabaseへの通信が可能かを確認
 */
export async function testSupabaseConnection() {
  console.log('=== testSupabaseConnection Server Action ===');
  
  // 1. 環境変数の直接確認
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log('Raw env check:');
  console.log('  NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl || 'UNDEFINED');
  console.log('  NEXT_PUBLIC_SUPABASE_URL type:', typeof supabaseUrl);
  console.log('  NEXT_PUBLIC_SUPABASE_URL === undefined:', supabaseUrl === undefined);
  console.log('  NEXT_PUBLIC_SUPABASE_URL === null:', supabaseUrl === null);
  console.log('  NEXT_PUBLIC_SUPABASE_URL length:', supabaseUrl?.length || 'N/A');
  console.log('  Contains "xxxxx":', supabaseUrl?.includes('xxxxx') || false);
  console.log('  Contains "placeholder":', supabaseUrl?.includes('placeholder') || false);
  console.log('  NEXT_PUBLIC_SUPABASE_ANON_KEY exists:', !!supabaseKey);
  console.log('  NEXT_PUBLIC_SUPABASE_ANON_KEY length:', supabaseKey?.length || 0);
  
  // 2. URL検証
  if (!supabaseUrl) {
    return {
      success: false,
      error: 'NEXT_PUBLIC_SUPABASE_URL is undefined',
      details: {
        url: supabaseUrl,
        keyExists: !!supabaseKey,
      },
    };
  }
  
  if (supabaseUrl.includes('xxxxx') || supabaseUrl.includes('placeholder')) {
    return {
      success: false,
      error: 'NEXT_PUBLIC_SUPABASE_URL contains placeholder value',
      details: {
        url: supabaseUrl,
        isPlaceholder: true,
      },
    };
  }
  
  // 3. 最小限のfetchテスト（Supabase Auth Health Check）
  try {
    const healthCheckUrl = `${supabaseUrl}/rest/v1/`;
    console.log('Attempting fetch to:', healthCheckUrl);
    
    const response = await fetch(healthCheckUrl, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey || '',
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Fetch response status:', response.status);
    console.log('Fetch response ok:', response.ok);
    
    return {
      success: true,
      status: response.status,
      statusText: response.statusText,
      details: {
        url: supabaseUrl,
        healthCheckUrl,
        responseOk: response.ok,
      },
    };
  } catch (error: any) {
    console.error('Fetch error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error cause:', error.cause);
    
    return {
      success: false,
      error: error.message || 'Unknown error',
      errorName: error.name,
      errorCode: error.code,
      errorCause: error.cause?.message || error.cause,
      details: {
        url: supabaseUrl,
        keyExists: !!supabaseKey,
      },
    };
  }
}

