import cors from 'cors'
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { cycleAgentStatus } from './data'
import { connect, disconnect, getConnection } from './oauth'
import { startRefreshLoop, stopRefreshLoop } from './refresh'
import { puzzelRouter } from './routes/puzzel'
import { screenlyRouter } from './routes/screenly'

const sourceDirectory = path.dirname(fileURLToPath(import.meta.url))

export function createApp(): express.Express {
  const app = express()
  app.use(cors())
  app.set('view engine', 'ejs')
  app.set('views', path.join(sourceDirectory, 'views'))
  app.use(express.static(path.join(sourceDirectory, '..', 'dist')))
  app.use(
    '/vendor/alpine',
    express.static(
      path.join(sourceDirectory, '..', 'node_modules', 'alpinejs', 'dist')
    )
  )

  app.get('/', (_req, res) => {
    res.render('index', { connection: getConnection(), error: null })
  })

  app.post('/connect', async (_req, res) => {
    const result = await connect()
    if ('error' in result) {
      res.status(400).render('index', { connection: null, error: result.error })
      return
    }
    startRefreshLoop()
    res.redirect('/')
  })

  app.post('/disconnect', (_req, res) => {
    stopRefreshLoop()
    disconnect()
    res.redirect('/')
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

  return app
}
