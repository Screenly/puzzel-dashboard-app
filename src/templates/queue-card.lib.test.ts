import { describe, expect, test } from 'bun:test'
import { formatDuration } from './queue-card.lib'

describe('formatDuration', () => {
  test('formats seconds under a minute', () => {
    expect(formatDuration(32)).toBe('0:32')
  })

  test('formats seconds over a minute, padding seconds', () => {
    expect(formatDuration(95)).toBe('1:35')
  })
})
