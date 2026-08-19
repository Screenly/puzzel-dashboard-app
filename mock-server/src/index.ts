import cors from 'cors'
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { agents, cycleAgentStatus, jitterData, queues } from './data'
import { puzzelRouter } from './routes/puzzel'
import { screenlyRouter } from './routes/screenly'

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

app.use('/puzzel', puzzelRouter)
app.use('/screenly', screenlyRouter)

app.listen(PORT, () => {
  console.log(`Mock Puzzel API running at http://localhost:${PORT}`)
  setInterval(jitterData, JITTER_INTERVAL_MS)
})
