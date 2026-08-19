import type { AgentStatus, QueueStats } from './api'
import { fetchAgentStatuses, fetchQueueStats } from './api'
import {
  agentStatusColor,
  agentStatusLabel,
  formatDuration,
  showScreen,
} from './app'

export type DashboardData = {
  queues: QueueStats[]
  agents: AgentStatus[]
}

export async function fetchDashboardData(
  accessToken: string,
  baseUrl: string,
  customerKey: string,
  userGroupName: string,
): Promise<DashboardData> {
  const [queues, agents] = await Promise.all([
    fetchQueueStats(baseUrl, accessToken, customerKey),
    fetchAgentStatuses(baseUrl, accessToken, customerKey, userGroupName),
  ])

  return { queues, agents }
}

function renderQueues(queues: QueueStats[]): void {
  const container = document.getElementById('queue-cards')
  if (!container) return

  container.innerHTML = ''
  queues.forEach((queue) => {
    const card = document.createElement('div')
    card.className = 'flex flex-col gap-3 rounded-xl bg-neutral-800 p-5'

    const title = document.createElement('h2')
    title.className = 'text-2xl font-semibold'
    title.textContent = queue.description
    card.appendChild(title)

    const stats = document.createElement('dl')
    stats.className = 'grid grid-cols-2 gap-x-4 gap-y-2 text-lg'
    const rows: [string, string][] = [
      ['Ready', String(queue.agentsReady)],
      ['Logged On', String(queue.agentsLoggedOn)],
      ['In Queue', String(queue.queueSize)],
      ['SLA', `${queue.sla}%`],
      ['Offered', String(queue.callsOfferedToday)],
      ['Answered', String(queue.callsAnsweredToday)],
      ['Avg Wait', formatDuration(queue.waitTimeAverageSeconds)],
      ['Max Wait', formatDuration(queue.waitTimeMaxSeconds)],
    ]
    rows.forEach(([label, value]) => {
      const dt = document.createElement('dt')
      dt.className = 'text-neutral-400'
      dt.textContent = label
      const dd = document.createElement('dd')
      dd.className = 'text-right font-medium'
      dd.textContent = value
      stats.appendChild(dt)
      stats.appendChild(dd)
    })
    card.appendChild(stats)

    container.appendChild(card)
  })
}

function renderAgents(agents: AgentStatus[]): void {
  const container = document.getElementById('agent-tiles')
  if (!container) return

  container.innerHTML = ''
  agents.forEach((agent) => {
    const tile = document.createElement('div')
    tile.className = `flex flex-col items-center justify-center gap-1 rounded-lg p-4 text-center ${agentStatusColor(agent.contactCentreStatus)}`

    const name = document.createElement('span')
    name.className = 'text-lg font-semibold'
    name.textContent = `${agent.firstName} ${agent.lastName}`
    tile.appendChild(name)

    const status = document.createElement('span')
    status.className = 'text-sm uppercase tracking-wide opacity-90'
    status.textContent = agentStatusLabel(agent.contactCentreStatus)
    tile.appendChild(status)

    container.appendChild(tile)
  })
}

export function renderDashboard(data: DashboardData): void {
  renderQueues(data.queues)
  renderAgents(data.agents)
  showScreen('dashboard')
}
