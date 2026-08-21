import './style.css'
import '@screenly/edge-apps/components'
import {
  getSettingWithDefault,
  setupErrorHandling,
  setupTheme,
  signalReady,
} from '@screenly/edge-apps'
import { getLocale } from '@screenly/edge-apps/utils'
import { refresh } from './dashboard'
import { DEFAULT_REFRESH_INTERVAL_SECONDS } from './constants'

document.addEventListener('DOMContentLoaded', async () => {
  setupErrorHandling()
  setupTheme()

  const refreshInterval = getSettingWithDefault<number>(
    'refresh_interval',
    DEFAULT_REFRESH_INTERVAL_SECONDS,
  )
  const locale = await getLocale()

  await refresh(locale)
  signalReady()

  setInterval(async () => {
    try {
      await refresh(locale)
    } catch (err) {
      console.error('Refresh failed:', err)
    }
  }, refreshInterval * 1000)
})
