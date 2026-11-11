import { html, render, type TemplateResult } from 'lit-html'
import type { AgentStatus } from '../api'
import { agentStatusColor, agentStatusLabel } from './agent-tile.lib'

const MAX_AGENT_TILES = 6

function agentTileTemplate(agent: AgentStatus): TemplateResult {
  return html`
    <div class="agent-tile">
      <span class="agent-tile-name">${agent.firstName} ${agent.lastName}</span>
      <span class="agent-tile-status">
        <span
          class="agent-tile-status-dot ${agentStatusColor(
            agent.contactCentreStatus,
          )}"
        ></span>
        ${agentStatusLabel(agent.contactCentreStatus)}
      </span>
    </div>
  `
}

export function mountAgentTiles(
  container: HTMLElement,
  agents: AgentStatus[],
): void {
  const visibleAgents = agents.slice(0, MAX_AGENT_TILES)

  render(
    html`${visibleAgents.map((agent) => agentTileTemplate(agent))}`,
    container,
  )
}
