import { getSettingWithDefault } from '@screenly/edge-apps'
import {
  readEdgeAppCache,
  reportError,
  writeEdgeAppCache,
} from '@screenly/edge-apps/utils'
import { fetchAgentStatuses, fetchQueueStats } from './api'
import { CACHE_NAMESPACE } from './constants'
import { fetchAccessToken } from './credentials'
import { renderDashboard } from './templates'
import type { DashboardData } from './templates'

async function getDashboardData(): Promise<DashboardData> {
  const displayErrors =
    getSettingWithDefault<string>('display_errors', 'false') === 'true'

  try {
    const accessToken = await fetchAccessToken()

    const [queues, agents] = await Promise.all([
      fetchQueueStats(accessToken),
      fetchAgentStatuses(accessToken),
    ])
    const data = { queues, agents }
    writeEdgeAppCache(CACHE_NAMESPACE, 'dashboard-data', data)
    return data
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    reportError(error, {
      source: 'puzzel-dashboard',
      customerKey: getSettingWithDefault<string>('customer_key', ''),
    })
    if (displayErrors) throw error
  }

  const cached = readEdgeAppCache<DashboardData>(
    CACHE_NAMESPACE,
    'dashboard-data',
  )
  if (!cached) throw new Error('No cached dashboard data found.')
  return cached
}

export async function refresh(locale: string): Promise<void> {
  const customerKey = getSettingWithDefault<string>('customer_key', '')
  const userId = getSettingWithDefault<string>('user_id', '')
  if (!customerKey) throw new Error('Please set a Customer Key in settings.')
  if (!userId) throw new Error('Please set a User ID in settings.')

  const data = await getDashboardData()
  renderDashboard(data, locale)
}
