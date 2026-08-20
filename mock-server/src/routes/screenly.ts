import { Router } from 'express'
import { getConnection } from '../oauth'

export const screenlyRouter = Router()

screenlyRouter.get('/access_token/', (_req, res) => {
  const connection = getConnection()
  if (!connection) {
    res.status(404).json({ error: 'Not connected. Visit / to connect.' })
    return
  }

  res.json({ token: connection.token })
})
