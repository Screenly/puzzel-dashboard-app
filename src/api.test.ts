import '@screenly/edge-apps/test'
import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test'
import { resetScreenlyMock, setupScreenlyMock } from '@screenly/edge-apps/test'
import { AuthError, fetchAgentStatuses, fetchQueueStats } from './api'

const BASE_SETTINGS = {
  customer_key: '12345',
  user_id: '67890',
}

const originalFetch = globalThis.fetch

function stubFetch(impl: () => Promise<unknown>) {
  const fetchMock = mock(impl)
  globalThis.fetch = fetchMock as unknown as typeof fetch
  return fetchMock
}

function fakeResponse(status: number, body: unknown) {
  return stubFetch(async () => ({
    status,
    ok: status >= 200 && status < 300,
    statusText: 'Error',
    json: async () => body,
  }))
}

describe('fetchQueueStats', () => {
  beforeEach(() => {
    setupScreenlyMock({}, BASE_SETTINGS)
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    resetScreenlyMock()
  })

  test('parses `result` on success', async () => {
    const body = { result: [{ id: 1, description: 'Support' }] }
    fakeResponse(200, body)

    const result = await fetchQueueStats('token')
    expect(result).toEqual(body.result)
  })

  test('throws AuthError on a 401 response', async () => {
    fakeResponse(401, {})

    await expect(fetchQueueStats('token')).rejects.toBeInstanceOf(AuthError)
  })

  test('throws AuthError on a 403 response', async () => {
    fakeResponse(403, {})

    await expect(fetchQueueStats('token')).rejects.toBeInstanceOf(AuthError)
  })

  test('throws a generic error on other non-ok statuses', async () => {
    fakeResponse(500, {})

    await expect(fetchQueueStats('token')).rejects.toThrow(
      /Failed to fetch queue stats: 500/,
    )
  })

  test('builds the request URL from customer_key and user_id settings', async () => {
    const fetchMock = fakeResponse(200, { result: [] })

    await fetchQueueStats('token')

    const [requestUrl] = fetchMock.mock.calls[0] as [URL]
    expect(requestUrl.toString()).toBe(
      'https://api.puzzel.com/ContactCentre5/12345/visualqueues/stateinformation/All?userId=67890',
    )
  })

  test('sends the token as a bearer auth header', async () => {
    const fetchMock = fakeResponse(200, { result: [] })

    await fetchQueueStats('my-token')

    const [, init] = fetchMock.mock.calls[0] as [URL, RequestInit]
    expect(init.headers).toEqual({ Authorization: 'Bearer my-token' })
  })
})

describe('fetchAgentStatuses', () => {
  beforeEach(() => {
    setupScreenlyMock({}, BASE_SETTINGS)
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    resetScreenlyMock()
  })

  test('parses `result` on success', async () => {
    const body = { result: [{ userId: 1, firstName: 'Ada' }] }
    fakeResponse(200, body)

    const result = await fetchAgentStatuses('token')
    expect(result).toEqual(body.result)
  })

  test('throws AuthError on a 401 response', async () => {
    fakeResponse(401, {})

    await expect(fetchAgentStatuses('token')).rejects.toBeInstanceOf(AuthError)
  })

  test('throws AuthError on a 403 response', async () => {
    fakeResponse(403, {})

    await expect(fetchAgentStatuses('token')).rejects.toBeInstanceOf(AuthError)
  })

  test('throws a generic error on other non-ok statuses', async () => {
    fakeResponse(500, {})

    await expect(fetchAgentStatuses('token')).rejects.toThrow(
      /Failed to fetch agent statuses: 500/,
    )
  })

  test('omits userGroupName from the query when the setting is blank', async () => {
    const fetchMock = fakeResponse(200, { result: [] })

    await fetchAgentStatuses('token')

    const [requestUrl] = fetchMock.mock.calls[0] as [URL]
    expect(requestUrl.toString()).toBe(
      'https://api.puzzel.com/ContactCentre5/12345/users/stateinformation/Today?userId=67890',
    )
  })

  test('includes userGroupName in the query when the setting is set', async () => {
    setupScreenlyMock({}, { ...BASE_SETTINGS, user_group_name: 'Support' })
    const fetchMock = fakeResponse(200, { result: [] })

    await fetchAgentStatuses('token')

    const [requestUrl] = fetchMock.mock.calls[0] as [URL]
    expect(requestUrl.toString()).toBe(
      'https://api.puzzel.com/ContactCentre5/12345/users/stateinformation/Today?userId=67890&userGroupName=Support',
    )
  })
})
