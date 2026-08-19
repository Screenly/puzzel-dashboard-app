import { Router, type NextFunction, type Request, type Response } from 'express'
import { agents, queues } from '../data'

function requireBearerToken(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const header = req.header('Authorization') ?? ''
  if (!header.startsWith('Bearer ') || header.length <= 'Bearer '.length) {
    res.status(401).json({ code: 401, message: 'Missing or invalid token' })
    return
  }
  next()
}

export const puzzelRouter = Router()

puzzelRouter.use(requireBearerToken)

// Mirrors VisualQueueStateAndTickerList: GET /{customerKey}/visualqueues/stateinformation/{result}
puzzelRouter.get(
  '/:customerKey/visualqueues/stateinformation/:result',
  (_req, res) => {
    res.json({ result: queues, code: 0, id: 'mock', message: 'OK' })
  },
)

// Mirrors AgentStateAndTickerList: GET /{customerKey}/users/stateinformation/{tickerPeriodWindow}
puzzelRouter.get(
  '/:customerKey/users/stateinformation/:tickerPeriodWindow',
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
puzzelRouter.get('/:customerKey/visualqueues', (_req, res) => {
  const result = queues.map(({ id, description }) => ({ id, description }))
  res.json({ result, code: 0, id: 'mock', message: 'OK' })
})
