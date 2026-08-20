import { createApp } from './app'
import { jitterData } from './data'
import { startRefreshLoop } from './refresh'

const PORT = 3000
const JITTER_INTERVAL_MS = 5000

createApp().listen(PORT, () => {
  console.log(`Mock Puzzel API running at http://localhost:${PORT}`)
  setInterval(jitterData, JITTER_INTERVAL_MS)
  startRefreshLoop()
})
