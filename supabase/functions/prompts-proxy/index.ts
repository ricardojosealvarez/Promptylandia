import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const SERVICE_KEY = Deno.env.get('PROMPTS_PROXY_SECRET_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const EDIT_PASSWORD = Deno.env.get('EDIT_PASSWORD')!

serve(async (req) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'content-type, apikey, authorization, x-edit-password',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }

  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  if (!SERVICE_KEY || !SUPABASE_URL || !EDIT_PASSWORD) {
    return new Response('Function is missing required secrets', { status: 500, headers: cors })
  }

  if (req.headers.get('x-edit-password') !== EDIT_PASSWORD) {
    return new Response('Unauthorized', { status: 401, headers: cors })
  }

  const { path, method, body, prefer } = await req.json()

  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': prefer || '',
    },
    body: body || undefined,
  })

  if (res.status === 204) {
    return new Response(null, { status: 204, headers: cors })
  }

  const text = await res.text()
  return new Response(text, {
    status: res.status,
    headers: {
      ...cors,
      'Content-Type': res.headers.get('content-type') || 'application/json',
    },
  })
})
