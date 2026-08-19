import { html, render, type TemplateResult } from 'lit-html'
import type { AgentStatus } from '../api'

const AGENT_STATUS_LABELS: Record<string, string> = {
  LoggedOff: 'Logged Off',
  LoggedOn: 'Ready',
  Pause: 'Paused',
}

const AGENT_STATUS_COLORS: Record<string, string> = {
  LoggedOff: 'bg-neutral-600',
  LoggedOn: 'bg-emerald-600',
  Pause: 'bg-amber-600',
}

function agentStatusLabel(status: string): string {
  return AGENT_STATUS_LABELS[status] ?? status
}

function agentStatusColor(status: string): string {
  return AGENT_STATUS_COLORS[status] ?? 'bg-neutral-600'
}

function agentTileTemplate(agent: AgentStatus): TemplateResult {
  return html`
    <div class="agent-tile ${agentStatusColor(agent.contactCentreStatus)}">
      <span class="agent-tile-name">${agent.firstName} ${agent.lastName}</span>
      <span class="agent-tile-status"
        >${agentStatusLabel(agent.contactCentreStatus)}</span
      >
    </div>
  `
}

export function mountAgentTiles(
  container: HTMLElement,
  agents: AgentStatus[],
): void {
  render(html`${agents.map((agent) => agentTileTemplate(agent))}`, container)
}
