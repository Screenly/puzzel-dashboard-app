import { html, render, type TemplateResult } from 'lit-html'
import type { QueueStats } from '../api'
import { mountQueueChart } from './queue-chart'

const MAX_QUEUE_CARDS = 3

function queueCardTemplate(queue: QueueStats): TemplateResult {
  return html`
    <div class="queue-card">
      <div class="queue-card-title">${queue.description}</div>
      <div class="queue-card-chart" id="queue-chart-${queue.id}"></div>
    </div>
  `
}

export function mountQueueCards(
  container: HTMLElement,
  queues: QueueStats[],
): void {
  const visibleQueues = queues.slice(0, MAX_QUEUE_CARDS)

  render(
    html`${visibleQueues.map((queue) => queueCardTemplate(queue))}`,
    container,
  )

  for (const queue of visibleQueues) {
    const chartContainer = document.getElementById(`queue-chart-${queue.id}`)
    if (chartContainer) mountQueueChart(chartContainer, queue)
  }
}
