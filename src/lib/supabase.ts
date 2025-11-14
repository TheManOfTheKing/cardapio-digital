import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Debug which keys are present without printing sensitive values
  console.error('[Supabase ENV check]', {
    hasUrl: Boolean(supabaseUrl),
    hasAnonKey: Boolean(supabaseAnonKey),
    viteEnvKeys: Object.keys(import.meta.env || {}).filter((k) => k.startsWith('VITE_')),
  });
  throw new Error(
    'Missing Supabase environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. Please set them in a .env file and restart the dev server.'
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
