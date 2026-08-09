import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// Your live Supabase Project Endpoint
const SUPABASE_URL = 'https://xvzocwcchjdiyudrqorq.supabase.co'

// Your public anonymous key (safe for client-side use with RLS enabled)
const SUPABASE_ANON_KEY = 'YOUR_PUBLIC_ANON_KEY_HERE'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
