import { test } from '@playwright/test'
import { RESOLUTIONS } from '@screenly/edge-apps/test/screenshots'
import {
  dashboardScreenlyJsContent,
  setupDashboardRoutes,
  setupEmptyQueuesRoutes,
  takeScreenshot,
} from './screenshots.lib'

for (const { width, height } of RESOLUTIONS) {
  test(`screenshot dashboard ${width}x${height}`, async ({ browser }) => {
    await takeScreenshot(
      browser,
      width,
      height,
      `dashboard-${width}x${height}.png`,
      dashboardScreenlyJsContent,
      (context) => setupDashboardRoutes(context),
    )
  })
}

for (const [width, height] of [
  [1920, 1080],
  [1080, 1920],
]) {
  test(`screenshot empty-queues ${width}x${height}`, async ({ browser }) => {
    await takeScreenshot(
      browser,
      width,
      height,
      `empty-queues-${width}x${height}.png`,
      dashboardScreenlyJsContent,
      (context) => setupEmptyQueuesRoutes(context),
    )
  })
}
