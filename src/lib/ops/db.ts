import 'server-only'
import { createClient } from '@supabase/supabase-js'

// All ops tables have RLS on with no policies. Initialize only when an operation
// actually needs the service-role client, so routes can load during preview builds
// without a production service-role key.
function createOpsClient(key: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rciyoqdtejxcjqnvbsoi.supabase.co',
    key,
    { auth: { persistSession: false } },
  )
}

type OpsClient = ReturnType<typeof createOpsClient>
let client: OpsClient | undefined

function getClient() {
  if (client) return client
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for operations')
  client = createOpsClient(key)
  return client
}

// Keep the existing db.from/db.storage call sites while deferring client creation.
export const db = new Proxy({} as OpsClient, {
  get(_target, property) {
    const current = getClient()
    const value = Reflect.get(current, property)
    return typeof value === 'function' ? value.bind(current) : value
  },
})

export async function logAssistant(channel: string, actor: string | null, action: string, detail?: unknown) {
  await db.from('assistant_log').insert({ channel, actor, action, detail: detail ?? null })
}
