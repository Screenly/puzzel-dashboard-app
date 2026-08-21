import '@screenly/edge-apps/test'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  mock,
  spyOn,
  test,
} from 'bun:test'
import { resetScreenlyMock, setupScreenlyMock } from '@screenly/edge-apps/test'
import * as utils from '@screenly/edge-apps/utils'
import { fetchAccessToken } from './credentials'

const BASE_SETTINGS = {
  access_token: '',
  display_errors: 'false',
  screenly_oauth_tokens_url: 'https://api.example.com/oauth/',
  screenly_app_auth_token: 'app-auth',
}

const reportError = spyOn(utils, 'reportError')
const readEdgeAppCache = spyOn(utils, 'readEdgeAppCache')
const writeEdgeAppCache = spyOn(utils, 'writeEdgeAppCache')

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
    json: async () => body,
  }))
}

// eslint-disable-next-line max-lines-per-function
describe('fetchAccessToken', () => {
  beforeEach(() => {
    setupScreenlyMock({}, BASE_SETTINGS)
    reportError.mockReset().mockImplementation(() => {})
    readEdgeAppCache.mockReset().mockReturnValue(null)
    writeEdgeAppCache.mockReset().mockImplementation(() => {})
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    resetScreenlyMock()
  })

  test('returns the access_token setting immediately without calling the broker', async () => {
    setupScreenlyMock({}, { ...BASE_SETTINGS, access_token: 'dev-token' })
    const fetchMock = stubFetch(async () => {
      throw new Error('should not be called')
    })

    const token = await fetchAccessToken()

    expect(token).toBe('dev-token')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  test('returns the fetched token and writes it to cache on success', async () => {
    fakeResponse(200, { token: 'live-token' })

    const token = await fetchAccessToken()

    expect(token).toBe('live-token')
    expect(writeEdgeAppCache).toHaveBeenCalledWith(
      expect.any(String),
      'credentials',
      { accessToken: 'live-token' },
    )
  })

  test('requests the access token endpoint with the expected url and auth header', async () => {
    const fetchMock = fakeResponse(200, { token: 'live-token' })

    await fetchAccessToken()

    const [requestUrl, init] = fetchMock.mock.calls[0] as [URL, RequestInit]
    expect(requestUrl.toString()).toBe(
      'https://api.example.com/oauth/access_token/',
    )
    expect(init.headers).toEqual(
      expect.objectContaining({ Authorization: 'Bearer app-auth' }),
    )
  })

  test('builds the correct url when screenly_oauth_tokens_url has no trailing slash', async () => {
    setupScreenlyMock(
      {},
      {
        ...BASE_SETTINGS,
        screenly_oauth_tokens_url: 'https://api.example.com/oauth',
      },
    )
    const fetchMock = fakeResponse(200, { token: 'live-token' })

    await fetchAccessToken()

    const [requestUrl] = fetchMock.mock.calls[0] as [URL]
    expect(requestUrl.toString()).toBe(
      'https://api.example.com/oauth/access_token/',
    )
  })

  test('rethrows and skips the cache when display_errors is on', async () => {
    setupScreenlyMock({}, { ...BASE_SETTINGS, display_errors: 'true' })
    readEdgeAppCache.mockReturnValue({ accessToken: 'cached-token' })
    stubFetch(async () => {
      throw new Error('network down')
    })

    await expect(fetchAccessToken()).rejects.toThrow('network down')
    expect(readEdgeAppCache).not.toHaveBeenCalled()
  })

  test('falls back to the cached token when display_errors is off', async () => {
    readEdgeAppCache.mockReturnValue({ accessToken: 'cached-token' })
    stubFetch(async () => {
      throw new Error('network down')
    })

    const token = await fetchAccessToken()

    expect(token).toBe('cached-token')
    expect(reportError).toHaveBeenCalledTimes(1)
  })

  test('falls back to an empty string when there is no cache and no dev token', async () => {
    readEdgeAppCache.mockReturnValue(null)
    stubFetch(async () => {
      throw new Error('network down')
    })

    const token = await fetchAccessToken()

    expect(token).toBe('')
  })

  test('falls back when the backend responds without a token', async () => {
    fakeResponse(200, { token: '' })

    const token = await fetchAccessToken()

    expect(token).toBe('')
    expect(reportError).toHaveBeenCalledTimes(1)
  })

  test('falls back on a non-ok response', async () => {
    fakeResponse(503, {})

    const token = await fetchAccessToken()

    expect(token).toBe('')
    expect(reportError).toHaveBeenCalledTimes(1)
  })
})
