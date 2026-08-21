import '@screenly/edge-apps/test'
import { afterEach, beforeEach, describe, expect, spyOn, test } from 'bun:test'
import { resetScreenlyMock, setupScreenlyMock } from '@screenly/edge-apps/test'
import * as utils from '@screenly/edge-apps/utils'
import * as api from './api'
import { CACHE_NAMESPACE } from './constants'
import * as credentials from './credentials'
import { refresh } from './dashboard'
import * as templates from './templates'

const readEdgeAppCache = spyOn(utils, 'readEdgeAppCache')
const writeEdgeAppCache = spyOn(utils, 'writeEdgeAppCache')
const reportError = spyOn(utils, 'reportError')

const fetchAccessToken = spyOn(credentials, 'fetchAccessToken')
const fetchQueueStats = spyOn(api, 'fetchQueueStats')
const fetchAgentStatuses = spyOn(api, 'fetchAgentStatuses')
const renderDashboard = spyOn(templates, 'renderDashboard')

const BASE_SETTINGS = {
  customer_key: '12345',
  user_id: '67890',
  display_errors: 'false',
}

// eslint-disable-next-line max-lines-per-function
describe('refresh', () => {
  beforeEach(() => {
    setupScreenlyMock({}, BASE_SETTINGS)
    fetchAccessToken.mockReset().mockImplementation(async () => 'access-token')
    fetchQueueStats
      .mockReset()
      .mockImplementation(async () => [{ id: 1, description: 'Support' }])
    fetchAgentStatuses
      .mockReset()
      .mockImplementation(async () => [{ userId: 1, firstName: 'Ada' }])
    renderDashboard.mockReset().mockImplementation(() => {})
    readEdgeAppCache.mockReset().mockReturnValue(null)
    writeEdgeAppCache.mockReset().mockImplementation(() => {})
    reportError.mockReset().mockImplementation(() => {})
  })

  afterEach(() => {
    resetScreenlyMock()
  })

  test('throws when customer_key is missing', async () => {
    setupScreenlyMock({}, { ...BASE_SETTINGS, customer_key: '' })

    await expect(refresh()).rejects.toThrow(
      'Please set a Customer Key in settings.',
    )
  })

  test('throws when user_id is missing', async () => {
    setupScreenlyMock({}, { ...BASE_SETTINGS, user_id: '' })

    await expect(refresh()).rejects.toThrow('Please set a User ID in settings.')
  })

  test('writes fetched data to cache and renders it on success', async () => {
    await refresh()

    const data = {
      queues: [{ id: 1, description: 'Support' }],
      agents: [{ userId: 1, firstName: 'Ada' }],
    }
    expect(writeEdgeAppCache).toHaveBeenCalledWith(
      CACHE_NAMESPACE,
      'dashboard-data',
      data,
    )
    expect(renderDashboard).toHaveBeenCalledWith(data)
  })

  test('rethrows and skips the cache when display_errors is on', async () => {
    setupScreenlyMock({}, { ...BASE_SETTINGS, display_errors: 'true' })
    fetchQueueStats.mockImplementation(async () => {
      throw new Error('down')
    })
    readEdgeAppCache.mockReturnValue({ queues: [], agents: [] })

    await expect(refresh()).rejects.toThrow('down')

    expect(readEdgeAppCache).not.toHaveBeenCalled()
    expect(renderDashboard).not.toHaveBeenCalled()
  })

  test('renders from cache on failure when display_errors is off', async () => {
    fetchQueueStats.mockImplementation(async () => {
      throw new Error('down')
    })
    const cached = {
      queues: [{ id: 2, description: 'Cached Queue' }],
      agents: [],
    }
    readEdgeAppCache.mockReturnValue(cached)

    await refresh()

    expect(renderDashboard).toHaveBeenCalledWith(cached)
    expect(reportError).toHaveBeenCalledWith(
      new Error('down'),
      expect.objectContaining({
        source: 'puzzel-dashboard',
        customerKey: '12345',
      }),
    )
  })

  test('throws when there is no cache to fall back to', async () => {
    fetchQueueStats.mockImplementation(async () => {
      throw new Error('down')
    })
    readEdgeAppCache.mockReturnValue(null)

    await expect(refresh()).rejects.toThrow('No cached dashboard data found.')
    expect(renderDashboard).not.toHaveBeenCalled()
  })
})
