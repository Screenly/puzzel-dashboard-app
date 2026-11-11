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
