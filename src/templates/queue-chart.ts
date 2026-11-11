import { Chart, registerables } from 'chart.js'
import type { QueueStats } from '../api'

Chart.register(...registerables)
Chart.defaults.animation = false

const CHART_COLORS = ['#4F8EF7', '#00C9A7', '#FFB347']

export function mountQueueChart(
  container: HTMLElement,
  queue: QueueStats,
): void {
  const data = [
    queue.callsOfferedToday,
    queue.callsAnsweredToday,
    queue.ciqsAnsweredToday,
  ]

  const existingCanvas = container.querySelector('canvas')
  const existingChart = existingCanvas && Chart.getChart(existingCanvas)
  if (existingChart) {
    existingChart.data.datasets[0].data = data
    existingChart.update()
    return
  }

  const canvas = document.createElement('canvas')
  container.appendChild(canvas)

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: ['Offered', 'Answered', 'Callback'],
      datasets: [{ data, backgroundColor: CHART_COLORS, barPercentage: 0.5 }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: {
          ticks: { color: '#ffffff', font: { size: 24 } },
          grid: { display: false },
        },
        y: {
          ticks: { color: '#ffffff', font: { size: 24 } },
          grid: { color: '#ffffff22' },
        },
      },
    },
  })
}
