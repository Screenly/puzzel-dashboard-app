import { loadToken } from './db'
import { connect } from './oauth'

const REFRESH_SAFETY_MARGIN_MS = 2 * 60 * 1000
const MIN_REFRESH_DELAY_MS = 60 * 1000

let refreshTimer: ReturnType<typeof setTimeout> | undefined

function scheduleNextRefresh(): void {
  if (refreshTimer) clearTimeout(refreshTimer)

  const token = loadToken()
  if (!token) return

  const delayMs = Math.max(
    token.expires_at * 1000 - Date.now() - REFRESH_SAFETY_MARGIN_MS,
    MIN_REFRESH_DELAY_MS
  )

  refreshTimer = setTimeout(() => {
    connect()
      .then((result) => {
        if ('error' in result) {
          console.error(`Puzzel token refresh failed: ${result.error}`)
          return
        }
        console.log(`Puzzel token refreshed at ${new Date().toISOString()}`)
        scheduleNextRefresh()
      })
      .catch((err) => console.error('Puzzel token refresh error:', err))
  }, delayMs)
}

export function startRefreshLoop(): void {
  scheduleNextRefresh()
}

export function stopRefreshLoop(): void {
  if (refreshTimer) clearTimeout(refreshTimer)
}
