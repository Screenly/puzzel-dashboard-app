import { describe, expect, test } from 'bun:test'
import { agentStatusColor, agentStatusLabel } from './agent-tile.lib'

describe('agentStatusLabel', () => {
  test('maps known statuses to their labels', () => {
    expect(agentStatusLabel('LoggedOff')).toBe('Logged Off')
    expect(agentStatusLabel('LoggedOn')).toBe('Ready')
    expect(agentStatusLabel('Pause')).toBe('Paused')
  })

  test('passes an unknown status through unchanged', () => {
    expect(agentStatusLabel('OnBreak')).toBe('OnBreak')
  })
})

describe('agentStatusColor', () => {
  test('maps known statuses to their colors', () => {
    expect(agentStatusColor('LoggedOff')).toBe('bg-neutral-600')
    expect(agentStatusColor('LoggedOn')).toBe('bg-emerald-600')
    expect(agentStatusColor('Pause')).toBe('bg-amber-600')
  })

  test('falls back to the default color for an unknown status', () => {
    expect(agentStatusColor('OnBreak')).toBe('bg-neutral-600')
  })
})
