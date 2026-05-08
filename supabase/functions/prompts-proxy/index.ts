import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const SERVICE_KEY = Deno.env.get('PROMPTS_PROXY_SECRET_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type, apikey, authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

type PromptInput = {
  categoria: string
  subcategoria: string
  ia: string
  nombre: string
  prompt: string
  notas?: string
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {...cors, 'Content-Type': 'application/json'},
  })

const text = (message: string, status: number) =>
  new Response(message, {status, headers: cors})

const requirePositiveId = (value: unknown) => {
  const id = typeof value === 'number' ? value : Number(value)
  if (!Number.isInteger(id) || id <= 0) throw new Error('Invalid id')
  return id
}

const normalizeText = (value: unknown, field: string, max: number, required = true) => {
  if (value === undefined || value === null) {
    if (required) throw new Error(`Missing ${field}`)
    return ''
  }
  if (typeof value !== 'string') throw new Error(`Invalid ${field}`)
  const trimmed = value.trim().normalize('NFC')
  if (required && !trimmed) throw new Error(`Missing ${field}`)
  if (trimmed.length > max) throw new Error(`${field} is too long`)
  return trimmed
}

const sanitizePrompt = (value: unknown): PromptInput => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Invalid prompt payload')
  }
  const raw = value as Record<string, unknown>
  const allowed = new Set(['categoria', 'subcategoria', 'ia', 'nombre', 'prompt', 'notas'])
  for (const key of Object.keys(raw)) {
    if (!allowed.has(key)) throw new Error(`Unexpected field: ${key}`)
  }
  return {
    categoria: normalizeText(raw.categoria, 'categoria', 160),
    subcategoria: normalizeText(raw.subcategoria, 'subcategoria', 160),
    ia: normalizeText(raw.ia, 'ia', 80).toUpperCase(),
    nombre: normalizeText(raw.nombre, 'nombre', 300),
    prompt: normalizeText(raw.prompt, 'prompt', 50000),
    notas: normalizeText(raw.notas, 'notas', 10000, false),
  }
}

const serviceFetch = async (path: string, init: RequestInit = {}) => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
      ...(init.headers || {}),
    },
  })

  if (res.status === 204) {
    return new Response(null, {status: 204, headers: cors})
  }

  const responseText = await res.text()
  return new Response(responseText, {
    status: res.status,
    headers: {
      ...cors,
      'Content-Type': res.headers.get('content-type') || 'application/json',
    },
  })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return text('ok', 200)
  if (req.method !== 'POST') return text('Method not allowed', 405)

  if (!SERVICE_KEY || !SUPABASE_URL) {
    return text('Function is missing required secrets', 500)
  }

  const authHeader = req.headers.get('Authorization') || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (!token || token.startsWith('sb_')) return text('Unauthorized', 401)

  const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${token}`,
    },
  })
  if (!userRes.ok) return text('Unauthorized', 401)

  const user = await userRes.json()
  if (!user?.id) return text('Unauthorized', 401)

  const adminRes = await serviceFetch(`admin_users?select=user_id&user_id=eq.${user.id}&limit=1`, {
    headers: {'Prefer': ''},
  })
  if (!adminRes.ok) return text('Admin check failed', 500)

  const admins = await adminRes.json()
  if (!Array.isArray(admins) || admins.length === 0) return text('Forbidden', 403)

  let payload: Record<string, unknown>
  try {
    payload = await req.json()
  } catch (_error) {
    return text('Invalid JSON', 400)
  }

  try {
    switch (payload.action) {
      case 'checkAdmin':
        return json({ok: true})

      case 'createPrompt': {
        const prompt = sanitizePrompt(payload.prompt)
        return serviceFetch('prompts', {
          method: 'POST',
          body: JSON.stringify(prompt),
        })
      }

      case 'updatePrompt': {
        const id = requirePositiveId(payload.id)
        const prompt = sanitizePrompt(payload.prompt)
        return serviceFetch(`prompts?id=eq.${id}`, {
          method: 'PATCH',
          body: JSON.stringify(prompt),
        })
      }

      case 'deletePrompt': {
        const id = requirePositiveId(payload.id)
        return serviceFetch(`prompts?id=eq.${id}`, {method: 'DELETE'})
      }

      case 'deletePrompts': {
        if (!Array.isArray(payload.ids)) throw new Error('Invalid ids')
        if (payload.ids.length < 1 || payload.ids.length > 100) throw new Error('Invalid ids length')
        const ids = payload.ids.map(requirePositiveId)
        return serviceFetch(`prompts?id=in.(${ids.join(',')})`, {method: 'DELETE'})
      }

      case 'importPrompts': {
        if (!Array.isArray(payload.prompts)) throw new Error('Invalid prompts')
        if (payload.prompts.length < 1 || payload.prompts.length > 100) throw new Error('Invalid prompts length')
        const prompts = payload.prompts.map(sanitizePrompt)
        return serviceFetch('prompts', {
          method: 'POST',
          body: JSON.stringify(prompts),
        })
      }

      default:
        return text('Action not allowed', 400)
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request'
    return text(message, 400)
  }
})
