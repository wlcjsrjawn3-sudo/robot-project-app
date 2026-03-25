import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

async function run() {
  console.log("Fetching admin records...")
  const { data, error } = await supabase.from('users').select('*').eq('role', 'admin').order('created_at', { ascending: true })
  
  if (error) {
    console.error("Error fetching admins:", error)
    return
  }

  if (data && data.length > 1) {
    const toKeep = data[0]
    const toDelete = data.slice(1).map(u => u.id)
    
    console.log(`Keeping oldest admin: ${toKeep.id} (${toKeep.created_at})`)
    console.log(`Deleting ${toDelete.length} duplicate admins...`)
    
    for (const id of toDelete) {
        const { error: delErr } = await supabase.from('users').delete().eq('id', id)
        if (delErr) {
            console.error("Failed to delete", id, delErr)
        } else {
            console.log("Deleted", id)
        }
    }
    console.log("✅ Cleanup complete!")
  } else {
    console.log("No duplicates found. Only 1 or 0 admins exist.")
  }
}

run()
