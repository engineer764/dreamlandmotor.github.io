import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const SUPABASE_URL = 'https://xvzocwcchjdiyudrqorq.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2em9jd2NjaGpkaXl1ZHJxb3JxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyOTQzOTYsImV4cCI6MjEwMTg3MDM5Nn0.2xG_Xqd0WDZEtuZAnWXJmjedlde2Omb-9JshXMVGFGs'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

/**
 * Authenticates an administrator or inspector.
 */
export async function loginStaff(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) throw new Error(error.message)

  // Verify user is active and registered in the public.users table
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .single()

  if (profileError || !profile || !profile.active) {
    await supabase.auth.signOut()
    throw new Error('Access denied. User profile not found or inactive.')
  }

  return { session: data.session, profile }
}

/**
 * Logs out the current user and redirects to login.
 */
export async function logoutStaff() {
  await supabase.auth.signOut()
  window.location.href = 'login.html'
}

/**
 * Secures admin pages by verifying active session and staff/admin role.
 */
export async function requireAuth() {
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error || !session) {
    window.location.href = 'login.html'
    return null
  }

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single()

  // Updated to match your database enum ('ADMIN', 'SUPER_ADMIN', 'INSPECTOR')
  if (!profile || !profile.active || (profile.role !== 'ADMIN' && profile.role !== 'SUPER_ADMIN' && profile.role !== 'INSPECTOR')) {
    alert('Unauthorized access.')
    await supabase.auth.signOut()
    window.location.href = 'login.html'
    return null
  }

  return { session, profile }
}
