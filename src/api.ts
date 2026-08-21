import { getSettingWithDefault } from '@screenly/edge-apps'
import {
  API_BASE_URL,
  TICKER_PERIOD_WINDOW,
  VISUAL_QUEUE_RESULT,
} from './constants'

export class AuthError extends Error {
  constructor(message = 'Puzzel authentication failed') {
    super(message)
    this.name = 'AuthError'
  }
}

export interface QueueStats {
  id: number
  description: string
  queueSize: number
  agentsLoggedOn: number
  agentsInPause: number
  agentsReady: number
  waitTimeMaxSeconds: number
  waitTimeAverageSeconds: number
  callsOfferedToday: number
  callsAnsweredToday: number
  ciqsOfferedToday: number
  ciqsAnsweredToday: number
  sla: number
}

export interface AgentStatus {
  userId: number
  firstName: string
  lastName: string
  contactCentreStatus: 'LoggedOff' | 'LoggedOn' | 'Pause'
  userStatus: string
  userGroupName: string
  callsOffered: number
  callsAnswered: number
}

function throwIfAuthError(res: Response): void {
  if (res.status === 401 || res.status === 403) {
    throw new AuthError()
  }
}

export async function fetchQueueStats(token: string): Promise<QueueStats[]> {
  const customerKey = getSettingWithDefault<string>('customer_key', '')
  const userId = getSettingWithDefault<string>('user_id', '')

  const url = new URL(
    `${customerKey}/visualqueues/stateinformation/${VISUAL_QUEUE_RESULT}`,
    `${API_BASE_URL}/`,
  )
  url.search = new URLSearchParams({ userId }).toString()

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })

  throwIfAuthError(res)
  if (!res.ok)
    throw new Error(
      `Failed to fetch queue stats: ${res.status} ${res.statusText}`,
    )

  const data = (await res.json()) as { result: QueueStats[] }
  return data.result
}

export async function fetchAgentStatuses(
  token: string,
): Promise<AgentStatus[]> {
  const customerKey = getSettingWithDefault<string>('customer_key', '')
  const userId = getSettingWithDefault<string>('user_id', '')
  const userGroupName = getSettingWithDefault<string>('user_group_name', '')

  const url = new URL(
    `${customerKey}/users/stateinformation/${TICKER_PERIOD_WINDOW}`,
    `${API_BASE_URL}/`,
  )
  const params = new URLSearchParams({ userId })
  if (userGroupName) {
    params.set('userGroupName', userGroupName)
  }
  url.search = params.toString()

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })

  throwIfAuthError(res)
  if (!res.ok)
    throw new Error(
      `Failed to fetch agent statuses: ${res.status} ${res.statusText}`,
    )

  const data = (await res.json()) as { result: AgentStatus[] }
  return data.result
}
