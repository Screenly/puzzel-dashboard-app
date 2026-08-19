import { Router } from 'express'

export const screenlyRouter = Router()

screenlyRouter.get('/access_token/', (_req, res) => {
  res.json({ token: 'mock-access-token' })
})
