import type { Browser } from '@playwright/test'
import {
  createMockScreenlyForScreenshots,
  FIXED_SCREENSHOT_DATE,
  getScreenshotsDir,
  setupClockMock,
  setupScreenlyJsMock,
} from '@screenly/edge-apps/test/screenshots'
import path from 'path'

const MOCK_CUSTOMER_KEY = '12345'
const MOCK_USER_ID = '67890'

export const MOCK_CREDENTIALS = {
  token: 'mock-access-token',
  metadata: {},
}

export const MOCK_QUEUES = [
  {
    id: 1,
    description: 'Support',
    queueSize: 3,
    agentsLoggedOn: 4,
    agentsInPause: 1,
    agentsReady: 3,
    waitTimeMaxSeconds: 95,
    waitTimeAverageSeconds: 32,
    callsOfferedToday: 58,
    callsAnsweredToday: 54,
    ciqsOfferedToday: 6,
    ciqsAnsweredToday: 5,
    sla: 92,
  },
  {
    id: 2,
    description: 'Sales',
    queueSize: 1,
    agentsLoggedOn: 3,
    agentsInPause: 0,
    agentsReady: 3,
    waitTimeMaxSeconds: 40,
    waitTimeAverageSeconds: 18,
    callsOfferedToday: 21,
    callsAnsweredToday: 20,
    ciqsOfferedToday: 3,
    ciqsAnsweredToday: 3,
    sla: 98,
  },
  {
    id: 3,
    description: 'Billing',
    queueSize: 0,
    agentsLoggedOn: 2,
    agentsInPause: 1,
    agentsReady: 1,
    waitTimeMaxSeconds: 0,
    waitTimeAverageSeconds: 0,
    callsOfferedToday: 9,
    callsAnsweredToday: 9,
    ciqsOfferedToday: 0,
    ciqsAnsweredToday: 0,
    sla: 100,
  },
]

export const MOCK_AGENTS = [
  {
    userId: 1,
    firstName: 'Ada',
    lastName: 'Nilsen',
    contactCentreStatus: 'LoggedOn',
    userStatus: 'Available',
    userGroupName: 'Support',
    callsOffered: 12,
    callsAnswered: 11,
  },
  {
    userId: 2,
    firstName: 'Bo',
    lastName: 'Eriksen',
    contactCentreStatus: 'Pause',
    userStatus: 'Busy',
    userGroupName: 'Support',
    callsOffered: 9,
    callsAnswered: 9,
  },
  {
    userId: 3,
    firstName: 'Cleo',
    lastName: 'Vik',
    contactCentreStatus: 'LoggedOn',
    userStatus: 'Available',
    userGroupName: 'Sales',
    callsOffered: 15,
    callsAnswered: 14,
  },
  {
    userId: 4,
    firstName: 'Dan',
    lastName: 'Aasen',
    contactCentreStatus: 'LoggedOff',
    userStatus: 'System',
    userGroupName: 'Billing',
    callsOffered: 4,
    callsAnswered: 4,
  },
]

export const { screenlyJsContent: dashboardScreenlyJsContent } =
  createMockScreenlyForScreenshots(
    { coordinates: [37.3861, -122.0839], location: 'Silicon Valley, USA' },
    {
      customer_key: MOCK_CUSTOMER_KEY,
      user_id: MOCK_USER_ID,
      refresh_interval: '15',
      display_errors: 'false',
      screenly_oauth_tokens_url: 'http://localhost:3000/',
      screenly_app_auth_token: 'mock-token',
    },
  )

export type BrowserContext = Awaited<ReturnType<Browser['newContext']>>

export async function takeScreenshot(
  browser: Browser,
  width: number,
  height: number,
  filename: string,
  screenlyJsContent: string,
  setup: (context: BrowserContext) => Promise<void>,
): Promise<void> {
  const screenshotsDir = getScreenshotsDir()
  const context = await browser.newContext({ viewport: { width, height } })
  const page = await context.newPage()

  await setupClockMock(page, FIXED_SCREENSHOT_DATE)
  await setupScreenlyJsMock(page, screenlyJsContent)
  await setup(context)

  await page.goto('/')
  await page.waitForLoadState('networkidle')

  await page.screenshot({
    path: path.join(screenshotsDir, filename),
    fullPage: false,
  })

  await context.close()
}

function mockCredentials(context: BrowserContext): Promise<void> {
  return context.route(/access_token\//, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_CREDENTIALS),
    }),
  )
}

export async function setupDashboardRoutes(
  context: BrowserContext,
): Promise<void> {
  await mockCredentials(context)

  await context.route(/visualqueues\/stateinformation/, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ result: MOCK_QUEUES }),
    }),
  )

  await context.route(/users\/stateinformation/, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ result: MOCK_AGENTS }),
    }),
  )
}

export async function setupEmptyQueuesRoutes(
  context: BrowserContext,
): Promise<void> {
  await mockCredentials(context)

  await context.route(/visualqueues\/stateinformation/, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ result: [] }),
    }),
  )

  await context.route(/users\/stateinformation/, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ result: [] }),
    }),
  )
}
