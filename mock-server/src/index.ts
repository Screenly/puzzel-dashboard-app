import cors from 'cors'
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { agents, cycleAgentStatus, jitterData, queues } from './data'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = 3000
const JITTER_INTERVAL_MS = 5000

const app = express()
app.use(cors())
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, '..', 'dist')))
app.use(
  '/vendor/alpine',
  express.static(path.join(__dirname, '..', 'node_modules', 'alpinejs', 'dist')),
)

function requireBearerToken(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
): void {
  const header = req.header('Authorization') ?? ''
  if (!header.startsWith('Bearer ') || header.length <= 'Bearer '.length) {
    res.status(401).json({ code: 401, message: 'Missing or invalid token' })
    return
  }
  next()
}

app.get('/', (_req, res) => {
  res.render('index', { queues, agents })
})

app.post('/admin/agents/:userId/cycle-status', (req, res) => {
  const userId = Number(req.params.userId)
  const agent = cycleAgentStatus(userId)
  if (!agent) {
    res.status(404).json({ message: 'Agent not found' })
    return
  }
  res.json(agent)
})

// Mirrors VisualQueueStateAndTickerList from the Puzzel Contact Centre REST
// API: GET /{customerKey}/visualqueues/stateinformation/{result}
app.get(
  '/:customerKey/visualqueues/stateinformation/:result',
  requireBearerToken,
  (_req, res) => {
    res.json({ result: queues, code: 0, id: 'mock', message: 'OK' })
  },
)

// Mirrors AgentStateAndTickerList: GET /{customerKey}/users/stateinformation/{tickerPeriodWindow}
app.get(
  '/:customerKey/users/stateinformation/:tickerPeriodWindow',
  requireBearerToken,
  (req, res) => {
    const { userGroupName } = req.query
    const filtered =
      typeof userGroupName === 'string' && userGroupName
        ? agents.filter((agent) => agent.userGroupName === userGroupName)
        : agents
    res.json({ result: filtered, code: 0, id: 'mock', message: 'OK' })
  },
)

// Mirrors VisualQueueList: GET /{customerKey}/visualqueues
app.get('/:customerKey/visualqueues', requireBearerToken, (_req, res) => {
  const result = queues.map(({ id, description }) => ({ id, description }))
  res.json({ result, code: 0, id: 'mock', message: 'OK' })
})

app.listen(PORT, () => {
  console.log(`Mock Puzzel API running at http://localhost:${PORT}`)
  setInterval(jitterData, JITTER_INTERVAL_MS)
})
