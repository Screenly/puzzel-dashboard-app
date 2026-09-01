import { TICKER_PERIOD_WINDOW, VISUAL_QUEUE_RESULT } from './constants'

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

export async function fetchQueueStats(
  baseUrl: string,
  token: string,
  customerKey: string,
): Promise<QueueStats[]> {
  const res = await fetch(
    `${baseUrl}/${customerKey}/visualqueues/stateinformation/${VISUAL_QUEUE_RESULT}`,
    { headers: { Authorization: `Bearer ${token}` } },
  )

  throwIfAuthError(res)
  if (!res.ok)
    throw new Error(
      `Failed to fetch queue stats: ${res.status} ${res.statusText}`,
    )

  const data = (await res.json()) as { result: QueueStats[] }
  return data.result
}

export async function fetchAgentStatuses(
  baseUrl: string,
  token: string,
  customerKey: string,
  userGroupName: string,
): Promise<AgentStatus[]> {
  const params = new URLSearchParams()
  if (userGroupName) {
    params.set('userGroupName', userGroupName)
  }

  const res = await fetch(
    `${baseUrl}/${customerKey}/users/stateinformation/${TICKER_PERIOD_WINDOW}?${params}`,
    { headers: { Authorization: `Bearer ${token}` } },
  )

  throwIfAuthError(res)
  if (!res.ok)
    throw new Error(
      `Failed to fetch agent statuses: ${res.status} ${res.statusText}`,
    )

  const data = (await res.json()) as { result: AgentStatus[] }
  return data.result
}
