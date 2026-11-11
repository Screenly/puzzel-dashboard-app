import type { AgentStatus, QueueStats } from '../api'
import { mountAgentTiles } from './agent-tile'
import { mountQueueCards } from './queue-card'

export type DashboardData = { queues: QueueStats[]; agents: AgentStatus[] }

export function renderDashboard(data: DashboardData): void {
  const queueContainer = document.getElementById('queue-cards')!
  const agentContainer = document.getElementById('agent-tiles')!
  const dashboard = document.getElementById('dashboard')!

  dashboard.style.display = 'flex'
  mountQueueCards(queueContainer, data.queues)
  mountAgentTiles(agentContainer, data.agents)
}
