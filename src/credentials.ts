import { getSettingWithDefault } from '@screenly/edge-apps'
import {
  readEdgeAppCache,
  reportError,
  writeEdgeAppCache,
} from '@screenly/edge-apps/utils'
import { CACHE_NAMESPACE } from './constants'

type CachedCredentials = { accessToken: string }

export async function fetchAccessToken(): Promise<string> {
  const devAccessToken = getSettingWithDefault<string>('access_token', '')
  if (devAccessToken) return devAccessToken

  const displayErrors =
    getSettingWithDefault<string>('display_errors', 'false') === 'true'

  try {
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

    writeEdgeAppCache(CACHE_NAMESPACE, 'credentials', {
      accessToken: body.token,
    })
    return body.token
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    reportError(error, { source: 'puzzel-credentials' })
    if (displayErrors) throw error

    const cached = readEdgeAppCache<CachedCredentials>(
      CACHE_NAMESPACE,
      'credentials',
    )
    return cached?.accessToken ?? ''
  }
}
