import type { AgentStatus, QueueStats } from '../api'
import { mountAgentTiles } from './agent-tile'
import { mountQueueCards } from './queue-card'

export type DashboardData = { queues: QueueStats[]; agents: AgentStatus[] }

function showDashboard(): void {
  const el = document.getElementById('dashboard')
  if (el) el.style.display = 'flex'
}

export function renderDashboard(data: DashboardData): void {
  const queueContainer = document.getElementById('queue-cards')
  const agentContainer = document.getElementById('agent-tiles')

  if (queueContainer) mountQueueCards(queueContainer, data.queues)
  if (agentContainer) mountAgentTiles(agentContainer, data.agents)

  showDashboard()
}
