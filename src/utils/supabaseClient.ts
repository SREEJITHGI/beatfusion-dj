import { createClient } from '@supabase/supabase-js';

// Retrieve overrides from localStorage if present
const customUrl = typeof window !== 'undefined' ? localStorage.getItem('BEATFUSION_SUPABASE_URL') : null;
const customKey = typeof window !== 'undefined' ? localStorage.getItem('BEATFUSION_SUPABASE_ANON_KEY') : null;

export const supabaseUrl = customUrl || import.meta.env.VITE_SUPABASE_URL || '';
export const supabaseAnonKey = customKey || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase environment variables are missing! ' +
    'Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  );
}

// Safely initialize the client to prevent crash on malformed inputs
let clientInstance: any;
try {
  clientInstance = createClient(supabaseUrl, supabaseAnonKey);
} catch (err) {
  console.error('Failed to initialize Supabase client:', err);
  // Create a dummy client structure to avoid crashing on property reads
  clientInstance = {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: async () => ({ data: {}, error: new Error('Database Offline') }),
      signUp: async () => ({ data: {}, error: new Error('Database Offline') }),
      signOut: async () => ({ error: null }),
      resetPasswordForEmail: async () => ({ error: new Error('Database Offline') }),
      signInWithOAuth: async () => ({ error: new Error('Database Offline') }),
    },
    from: () => ({
      select: () => ({
        order: () => ({ limit: () => Promise.resolve({ data: null, error: new Error('Database Offline') }) }),
        eq: () => ({ single: () => Promise.resolve({ data: null, error: new Error('Database Offline') }) }),
        limit: () => Promise.resolve({ data: null, error: new Error('Database Offline') }),
      }),
      insert: () => Promise.resolve({ data: null, error: new Error('Database Offline') }),
    }),
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: null, error: new Error('Database Offline') }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
      }),
    },
  };
}

export const supabase = clientInstance;

/**
 * Checks if the Supabase project is reachable and functioning (not over quota/suspended).
 * Resolves with true if reachable, false/error details if failed.
 */
export async function testSupabaseConnection(url?: string, key?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const testUrl = url || supabaseUrl;
    const testKey = key || supabaseAnonKey;
    if (!testUrl || !testKey) {
      return { success: false, error: 'Connection details are empty.' };
    }

    // Initialize temporary client to test credentials
    const testClient = createClient(testUrl, testKey);
    
    // Attempt a simple select on a common table
    // If the project is over quota, this will return an error or fail with 429/402
    const { error } = await testClient.from('tracks').select('id').limit(1);
    
    if (error) {
      // Check if it's a specific auth or quota error
      console.warn('Supabase test query error details:', error);
      
      // Let special codes pass if the table simply doesn't exist but API responded
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        return { success: true };
      }
      return { success: false, error: `${error.message} (Code: ${error.code})` };
    }
    
    return { success: true };
  } catch (err: any) {
    console.error('Supabase connection test exception:', err);
    return { success: false, error: err.message || 'Network request failed' };
  }
}

/**
 * Helper to check if a custom connection is active
 */
export function isUsingCustomConnection(): boolean {
  return !!customUrl && !!customKey;
}
