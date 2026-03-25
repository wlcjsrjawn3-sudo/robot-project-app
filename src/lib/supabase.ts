import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Utility to check if we are using mock mode
export const isMockMode = supabaseUrl.includes('mock.supabase.co') || supabaseKey === 'mock_anon_key'
