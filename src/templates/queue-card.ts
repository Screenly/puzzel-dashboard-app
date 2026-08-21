import { html, render, type TemplateResult } from 'lit-html'
import type { QueueStats } from '../api'
import { formatDuration } from './queue-card.lib'
import { mountQueueChart } from './queue-chart'

function queueCardTemplate(queue: QueueStats, locale: string): TemplateResult {
  const number = new Intl.NumberFormat(locale)

  return html`
    <div class="queue-card">
      <h2 class="queue-card-title">${queue.description}</h2>
      <dl class="queue-card-stats">
        <dt>Ready</dt>
        <dd>${number.format(queue.agentsReady)}</dd>
        <dt>Logged On</dt>
        <dd>${number.format(queue.agentsLoggedOn)}</dd>
        <dt>In Queue</dt>
        <dd>${number.format(queue.queueSize)}</dd>
        <dt>SLA</dt>
        <dd>${number.format(queue.sla)}%</dd>
        <dt>Offered</dt>
        <dd>${number.format(queue.callsOfferedToday)}</dd>
        <dt>Answered</dt>
        <dd>${number.format(queue.callsAnsweredToday)}</dd>
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
  locale: string,
): void {
  render(
    html`${queues.map((queue) => queueCardTemplate(queue, locale))}`,
    container,
  )

  for (const queue of queues) {
    const chartContainer = document.getElementById(`queue-chart-${queue.id}`)
    if (chartContainer) mountQueueChart(chartContainer, queue)
  }
}
