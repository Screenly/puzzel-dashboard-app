import { Chart, registerables } from 'chart.js'
import type { QueueStats } from '../api'

Chart.register(...registerables)
Chart.defaults.animation = false

const CHART_COLORS = ['#4F8EF7', '#00C9A7', '#FFB347']

export function mountQueueChart(
  container: HTMLElement,
  queue: QueueStats,
): void {
  const existingCanvas = container.querySelector('canvas')
  if (existingCanvas) Chart.getChart(existingCanvas)?.destroy()
  container.replaceChildren()

  const canvas = document.createElement('canvas')
  container.appendChild(canvas)

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: ['Offered', 'Answered', 'Callback'],
      datasets: [
        {
          data: [
            queue.callsOfferedToday,
            queue.callsAnsweredToday,
            queue.ciqsAnsweredToday,
          ],
          backgroundColor: CHART_COLORS,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#ffffff' }, grid: { display: false } },
        y: { ticks: { color: '#ffffff' }, grid: { color: '#ffffff22' } },
      },
    },
  })
}
