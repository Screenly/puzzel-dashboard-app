import { PUZZEL_TOKEN_URL } from './constants'
import { clearToken, loadToken, saveToken } from './db'

interface PuzzelTokenResponse {
  access_token?: string
  expires_in?: number
  error?: string
  error_description?: string
}

export interface Connection {
  token: string
  tenantId: string
  userId: string
}

export async function connect(): Promise<{ error: string } | { ok: true }> {
  const clientId = process.env.PUZZEL_CLIENT_KEY
  const clientSecret = process.env.PUZZEL_CLIENT_SECRET
  const tenantId = process.env.PUZZEL_TENANT_ID
  const userId = process.env.PUZZEL_USER_ID

  if (!clientId || !clientSecret || !tenantId || !userId) {
    return {
      error:
        'PUZZEL_CLIENT_KEY, PUZZEL_CLIENT_SECRET, PUZZEL_TENANT_ID, and PUZZEL_USER_ID must all be set (see .env.example).',
    }
  }

  const res = await fetch(PUZZEL_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      scope: `contact-centre:${tenantId}:${userId}`,
      grant_type: 'client_credentials',
    }).toString(),
  })

  const data = (await res.json()) as PuzzelTokenResponse
  if (!res.ok || !data.access_token) {
    return {
      error: data.error_description ?? data.error ?? `HTTP ${res.status}`,
    }
  }

  saveToken({
    access_token: data.access_token,
    expires_at: Math.floor(Date.now() / 1000) + (data.expires_in ?? 900),
    tenant_id: tenantId,
    user_id: userId,
  })

  return { ok: true }
}

export function disconnect(): void {
  clearToken()
}

export function getConnection(): Connection | null {
  const token = loadToken()
  if (!token) return null
  if (token.expires_at * 1000 <= Date.now()) return null
  return {
    token: token.access_token,
    tenantId: token.tenant_id,
    userId: token.user_id,
  }
}
