import { getSettingWithDefault } from '@screenly/edge-apps'
import {
  readEdgeAppCache,
  reportError,
  writeEdgeAppCache,
} from '@screenly/edge-apps/utils'
import { CACHE_NAMESPACE, PUZZEL_TOKEN_URL } from './constants'

type CachedCredentials = { accessToken: string }

interface PuzzelTokenResponse {
  access_token?: string
  expires_in?: number
  error?: string
  error_description?: string
}

export const clientCredentialsCache: {
  accessToken: string
  expiresAt: number
} = {
  accessToken: '',
  expiresAt: 0,
}

async function fetchClientCredentialsToken(
  clientId: string,
  clientSecret: string,
): Promise<string> {
  if (clientCredentialsCache.expiresAt > Date.now()) {
    return clientCredentialsCache.accessToken
  }

  const customerKey = getSettingWithDefault<string>('customer_key', '')
  const userId = getSettingWithDefault<string>('user_id', '')

  const response = await fetch(PUZZEL_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      scope: `contact-centre:${customerKey}:${userId}`,
      grant_type: 'client_credentials',
    }),
  })

  const body = (await response.json()) as PuzzelTokenResponse
  if (!response.ok || !body.access_token) {
    throw new Error(
      body.error_description ??
        body.error ??
        `Puzzel token request failed (${response.status}).`,
    )
  }

  clientCredentialsCache.accessToken = body.access_token
  clientCredentialsCache.expiresAt =
    Date.now() + (body.expires_in ?? 900) * 1000 - 30_000
  writeEdgeAppCache(CACHE_NAMESPACE, 'credentials', {
    accessToken: body.access_token,
  })
  return body.access_token
}

async function fetchBrokerToken(): Promise<string> {
  const oauthTokensUrl = String(screenly.settings.screenly_oauth_tokens_url)
  const url = new URL(
    'access_token/',
    oauthTokensUrl.endsWith('/') ? oauthTokensUrl : `${oauthTokensUrl}/`,
  )
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${screenly.settings.screenly_app_auth_token}`,
    },
  })
  if (!response.ok) {
    throw new Error(
      `Screenly returned an unexpected error (${response.status}).`,
    )
  }

  const body = (await response.json()) as { token?: string }
  if (!body.token) throw new Error('No access token available.')

  writeEdgeAppCache(CACHE_NAMESPACE, 'credentials', { accessToken: body.token })
  return body.token
}

export async function fetchAccessToken(): Promise<string> {
  const clientId = getSettingWithDefault<string>('client_id', '')
  const clientSecret = getSettingWithDefault<string>('client_secret', '')
  const devAccessToken = getSettingWithDefault<string>('access_token', '')
  const displayErrors =
    getSettingWithDefault<string>('display_errors', 'false') === 'true'

  if ((!clientId || !clientSecret) && devAccessToken) return devAccessToken

  try {
    if (clientId && clientSecret) {
      return await fetchClientCredentialsToken(clientId, clientSecret)
    }
    return await fetchBrokerToken()
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    reportError(error, { source: 'puzzel-credentials' })
    if (displayErrors) throw error

    const cached = readEdgeAppCache<CachedCredentials>(
      CACHE_NAMESPACE,
      'credentials',
    )
    return cached?.accessToken ?? devAccessToken
  }
}
