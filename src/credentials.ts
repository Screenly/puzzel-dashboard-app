import { getSettingWithDefault } from '@screenly/edge-apps'

export async function fetchAccessToken(): Promise<string> {
  const devAccessToken = getSettingWithDefault<string>('access_token', '')

  const response = await fetch(
    `${screenly.settings.screenly_oauth_tokens_url}access_token/`,
    {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${screenly.settings.screenly_app_auth_token}`,
      },
    },
  ).catch(() => null)
  if (!response?.ok) return devAccessToken

  const body = (await response.json().catch(() => null)) as {
    token?: string
  } | null
  return body?.token ?? devAccessToken
}
