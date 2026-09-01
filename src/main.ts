import './style.css'
import '@screenly/edge-apps/components'
import {
  getCredentials,
  getSettingWithDefault,
  initTokenRefreshLoop,
  setupErrorHandling,
  setupTheme,
  signalReady,
} from '@screenly/edge-apps'
import { createErrorReporter, showError } from './app'
import { withFreshToken } from './auth'
import type { RuntimeState } from './auth'
import {
  DEFAULT_API_BASE_URL,
  DEFAULT_REFRESH_INTERVAL_SECONDS,
} from './constants'
import { fetchDashboardData, renderDashboard } from './render'

document.addEventListener('DOMContentLoaded', async () => {
  setupErrorHandling()
  setupTheme()

  const customerKey = getSettingWithDefault<string>('customer_key', '')
  const userGroupName = getSettingWithDefault<string>('user_group_name', '')
  const baseUrl = getSettingWithDefault<string>(
    'api_base_url',
    DEFAULT_API_BASE_URL,
  )
  const refreshInterval = getSettingWithDefault<number>(
    'refresh_interval',
    DEFAULT_REFRESH_INTERVAL_SECONDS,
  )
  const displayErrors =
    getSettingWithDefault<string>('display_errors', 'false') === 'true'
  const reportError = createErrorReporter(displayErrors)

  if (!customerKey) {
    showError('Please set a Customer Key in settings.')
    signalReady()
    return
  }

  let accessToken: string | null = null
  let credentialError: Error | null = null

  const refreshToken = async () => {
    const devToken = getSettingWithDefault<string>('access_token', '')
    if (devToken) {
      accessToken = devToken
      credentialError = null
      return
    }
    const { token } = await getCredentials()
    accessToken = token
    credentialError = null
  }

  try {
    await refreshToken()
  } catch (err) {
    credentialError = err instanceof Error ? err : new Error(String(err))
    console.warn('Failed to fetch initial credentials:', err)
  }

  initTokenRefreshLoop(refreshToken)

  const getRuntimeState = (): RuntimeState => ({ accessToken, credentialError })

  const run = () =>
    withFreshToken(
      getRuntimeState,
      refreshToken,
      reportError,
      async (token) => {
        const data = await fetchDashboardData(
          token,
          baseUrl,
          customerKey,
          userGroupName,
        )
        renderDashboard(data)
      },
    )

  await run()
  signalReady()

  setInterval(async () => {
    try {
      await run()
    } catch (err) {
      console.error('Refresh failed:', err)
    }
  }, refreshInterval * 1000)
})
