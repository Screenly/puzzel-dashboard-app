import './style.css'
import '@screenly/edge-apps/components'
import {
  getSettingWithDefault,
  setupErrorHandling,
  setupTheme,
  signalReady,
} from '@screenly/edge-apps'
import { refresh } from './dashboard'
import { DEFAULT_REFRESH_INTERVAL_SECONDS } from './constants'

document.addEventListener('DOMContentLoaded', async () => {
  setupErrorHandling()
  setupTheme()

  const refreshInterval = getSettingWithDefault<number>(
    'refresh_interval',
    DEFAULT_REFRESH_INTERVAL_SECONDS,
  )

  await refresh()
  signalReady()

  setInterval(() => refresh(), refreshInterval * 1000)
})
