export function showScreen(screenId: string): void {
  const screens = ['dashboard', 'error-screen']
  screens.forEach((id) => {
    const el = document.getElementById(id)
    if (el) {
      el.style.display = id === screenId ? 'flex' : 'none'
    }
  })
}

export function showError(message: string): void {
  showScreen('error-screen')
  const el = document.getElementById('error-message')
  if (el) {
    el.textContent = message
  }
}

export type ErrorReporter = (message: string) => void

export function createErrorReporter(displayErrors: boolean): ErrorReporter {
  if (displayErrors)
    return (msg) => {
      throw new Error(msg)
    }
  return showError
}

export function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

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

export function agentStatusLabel(status: string): string {
  return AGENT_STATUS_LABELS[status] ?? status
}

export function agentStatusColor(status: string): string {
  return AGENT_STATUS_COLORS[status] ?? 'bg-neutral-600'
}
