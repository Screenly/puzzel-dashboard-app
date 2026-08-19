import { html, render, type TemplateResult } from 'lit-html'
import type { QueueStats } from '../api'
import { mountQueueChart } from './queue-chart'

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

function queueCardTemplate(queue: QueueStats): TemplateResult {
  return html`
    <div class="queue-card">
      <h2 class="queue-card-title">${queue.description}</h2>
      <dl class="queue-card-stats">
        <dt>Ready</dt>
        <dd>${queue.agentsReady}</dd>
        <dt>Logged On</dt>
        <dd>${queue.agentsLoggedOn}</dd>
        <dt>In Queue</dt>
        <dd>${queue.queueSize}</dd>
        <dt>SLA</dt>
        <dd>${queue.sla}%</dd>
        <dt>Offered</dt>
        <dd>${queue.callsOfferedToday}</dd>
        <dt>Answered</dt>
        <dd>${queue.callsAnsweredToday}</dd>
        <dt>Avg Wait</dt>
        <dd>${formatDuration(queue.waitTimeAverageSeconds)}</dd>
        <dt>Max Wait</dt>
        <dd>${formatDuration(queue.waitTimeMaxSeconds)}</dd>
      </dl>
      <div class="queue-card-chart" id="queue-chart-${queue.id}"></div>
    </div>
  `
}

export function mountQueueCards(
  container: HTMLElement,
  queues: QueueStats[],
): void {
  render(html`${queues.map((queue) => queueCardTemplate(queue))}`, container)

  for (const queue of queues) {
    const chartContainer = document.getElementById(`queue-chart-${queue.id}`)
    if (chartContainer) mountQueueChart(chartContainer, queue)
  }
}
