import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const SERVICE_KEY = Deno.env.get('PROMPTS_PROXY_SECRET_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!

serve(async (req) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'content-type, apikey, authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }

  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  if (!SERVICE_KEY || !SUPABASE_URL) {
    return new Response('Function is missing required secrets', { status: 500, headers: cors })
  }

  const authHeader = req.headers.get('Authorization') || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (!token || token.startsWith('sb_')) {
    return new Response('Unauthorized', { status: 401, headers: cors })
  }

  const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${token}`,
    },
  })
  if (!userRes.ok) {
    return new Response('Unauthorized', { status: 401, headers: cors })
  }

  const user = await userRes.json()
  if (!user?.id) {
    return new Response('Unauthorized', { status: 401, headers: cors })
  }

  const adminRes = await fetch(`${SUPABASE_URL}/rest/v1/admin_users?select=user_id&user_id=eq.${user.id}&limit=1`, {
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
  })
  if (!adminRes.ok) {
    return new Response('Admin check failed', { status: 500, headers: cors })
  }
  const admins = await adminRes.json()
  if (!Array.isArray(admins) || admins.length === 0) {
    return new Response('Forbidden', { status: 403, headers: cors })
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
