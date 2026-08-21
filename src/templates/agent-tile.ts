import { html, render, type TemplateResult } from 'lit-html'
import type { AgentStatus } from '../api'
import { agentStatusColor, agentStatusLabel } from './agent-tile.lib'

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

function renderTiles(container: HTMLElement, agents: AgentStatus[]): void {
  render(html`${agents.map((agent) => agentTileTemplate(agent))}`, container)
}

function countFittingTiles(container: HTMLElement): number {
  const tiles = Array.from(container.children) as HTMLElement[]
  const bottomLimit = container.getBoundingClientRect().bottom

  return tiles.filter(
    (tile) => tile.getBoundingClientRect().bottom <= bottomLimit,
  ).length
}

export function mountAgentTiles(
  container: HTMLElement,
  agents: AgentStatus[],
): void {
  renderTiles(container, agents)

  const fittingCount = countFittingTiles(container)
  if (fittingCount < agents.length) {
    renderTiles(container, agents.slice(0, fittingCount))
  }
}
