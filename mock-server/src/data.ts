export type ContactCentreStatus = 'LoggedOff' | 'LoggedOn' | 'Pause'

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
  contactCentreStatus: ContactCentreStatus
  userStatus: string
  userGroupName: string
  callsOffered: number
  callsAnswered: number
}

export const queues: QueueStats[] = [
  {
    id: 1,
    description: 'Support',
    queueSize: 3,
    agentsLoggedOn: 4,
    agentsInPause: 1,
    agentsReady: 3,
    waitTimeMaxSeconds: 95,
    waitTimeAverageSeconds: 32,
    callsOfferedToday: 58,
    callsAnsweredToday: 54,
    ciqsOfferedToday: 6,
    ciqsAnsweredToday: 5,
    sla: 92,
  },
  {
    id: 2,
    description: 'Sales',
    queueSize: 1,
    agentsLoggedOn: 3,
    agentsInPause: 0,
    agentsReady: 3,
    waitTimeMaxSeconds: 40,
    waitTimeAverageSeconds: 18,
    callsOfferedToday: 21,
    callsAnsweredToday: 20,
    ciqsOfferedToday: 3,
    ciqsAnsweredToday: 3,
    sla: 98,
  },
  {
    id: 3,
    description: 'Billing',
    queueSize: 0,
    agentsLoggedOn: 2,
    agentsInPause: 1,
    agentsReady: 1,
    waitTimeMaxSeconds: 0,
    waitTimeAverageSeconds: 0,
    callsOfferedToday: 9,
    callsAnsweredToday: 9,
    ciqsOfferedToday: 0,
    ciqsAnsweredToday: 0,
    sla: 100,
  },
]

export const agents: AgentStatus[] = [
  {
    userId: 1,
    firstName: 'Ada',
    lastName: 'Nilsen',
    contactCentreStatus: 'LoggedOn',
    userStatus: 'Available',
    userGroupName: 'Support',
    callsOffered: 12,
    callsAnswered: 11,
  },
  {
    userId: 2,
    firstName: 'Bo',
    lastName: 'Eriksen',
    contactCentreStatus: 'Pause',
    userStatus: 'Busy',
    userGroupName: 'Support',
    callsOffered: 9,
    callsAnswered: 9,
  },
  {
    userId: 3,
    firstName: 'Cleo',
    lastName: 'Vik',
    contactCentreStatus: 'LoggedOn',
    userStatus: 'Available',
    userGroupName: 'Sales',
    callsOffered: 15,
    callsAnswered: 14,
  },
  {
    userId: 4,
    firstName: 'Dan',
    lastName: 'Aasen',
    contactCentreStatus: 'LoggedOff',
    userStatus: 'System',
    userGroupName: 'Billing',
    callsOffered: 4,
    callsAnswered: 4,
  },
]

function randomWalk(value: number, spread: number, min = 0): number {
  const delta = Math.floor(Math.random() * (spread * 2 + 1)) - spread
  return Math.max(min, value + delta)
}

export function jitterData(): void {
  queues.forEach((queue) => {
    queue.queueSize = randomWalk(queue.queueSize, 1)
    queue.waitTimeAverageSeconds = randomWalk(queue.waitTimeAverageSeconds, 5)
    queue.waitTimeMaxSeconds = Math.max(
      queue.waitTimeMaxSeconds,
      queue.waitTimeAverageSeconds
    )
    queue.callsOfferedToday = randomWalk(queue.callsOfferedToday, 1)
    queue.callsAnsweredToday = Math.min(
      queue.callsOfferedToday,
      randomWalk(queue.callsAnsweredToday, 1)
    )
    queue.ciqsOfferedToday = randomWalk(queue.ciqsOfferedToday, 1)
    queue.ciqsAnsweredToday = Math.min(
      queue.ciqsOfferedToday,
      randomWalk(queue.ciqsAnsweredToday, 1)
    )
  })
}

export function cycleAgentStatus(userId: number): AgentStatus | undefined {
  const order: ContactCentreStatus[] = ['LoggedOn', 'Pause', 'LoggedOff']
  const agent = agents.find((a) => a.userId === userId)
  if (!agent) return undefined

  const nextIndex =
    (order.indexOf(agent.contactCentreStatus) + 1) % order.length
  agent.contactCentreStatus = order[nextIndex]
  return agent
}
