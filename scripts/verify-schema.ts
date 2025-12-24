import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifySchema() {
  console.log('Verifying schema...')

  const tablesToCheck = ['songs', 'daily_stats']
  const viewsToCheck = ['daily_trending_songs']

  let allExist = true

  for (const table of tablesToCheck) {
    // Try to select 0 rows, just to check if table exists (and we have permission)
    const { error } = await supabase.from(table).select('*').limit(0)
    if (error) {
      // If error code is '42P01' (undefined_table), it doesn't exist. 
      // Other errors might mean permission issues, but implies existence.
      if (error.code === '42P01') {
        console.error(`❌ Table '${table}' does not exist.`)
        allExist = false
      } else {
         console.log(`⚠️  Table '${table}' check returned error: ${error.message} (might exist but permission denied)`)
         // We assume it exists if it's not "undefined_table"
      }
    } else {
      console.log(`✅ Table '${table}' exists.`)
    }
  }

  for (const view of viewsToCheck) {
    const { error } = await supabase.from(view).select('*').limit(0)
    if (error) {
       if (error.code === '42P01') {
        console.error(`❌ View '${view}' does not exist.`)
        allExist = false
      } else {
         console.log(`⚠️  View '${view}' check returned error: ${error.message}`)
      }
    } else {
      console.log(`✅ View '${view}' exists.`)
    }
  }

  if (allExist) {
    console.log('Schema verification passed!')
  } else {
    console.error('Schema verification failed.')
    process.exit(1)
  }
}

verifySchema()
