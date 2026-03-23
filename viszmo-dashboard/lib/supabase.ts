import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL or Anon Key is missing');
}

let activeToken: string | null = null;

export const setSupabaseToken = (token: string | null) => {
  activeToken = token;
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: async (url, options = {}) => {
      const headers = new Headers(options?.headers);
      if (activeToken) {
        headers.set('Authorization', `Bearer ${activeToken}`);
      }
      return fetch(url, {
        ...options,
        headers,
      });
    },
  },
});

export const getSupabaseClient = (clerkToken?: string) => {
  if (clerkToken) setSupabaseToken(clerkToken);
  return supabase;
};
