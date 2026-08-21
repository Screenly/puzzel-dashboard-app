import { Router, type NextFunction, type Request, type Response } from 'express'
import { PUZZEL_API_BASE_URL } from '../constants'
import { agents, queues } from '../data'
import { getConnection } from '../oauth'

function requireBearerToken(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const header = req.header('Authorization') ?? ''
  if (!header.startsWith('Bearer ') || header.length <= 'Bearer '.length) {
    res.status(401).json({ code: 401, message: 'Missing or invalid token' })
    return
  }
  next()
}

async function proxyToRealPuzzel(
  path: string,
  query: Record<string, string>,
  res: Response
): Promise<boolean> {
  const connection = getConnection()
  if (!connection) return false

  const params = new URLSearchParams(query)
  params.set('userId', connection.userId)
  const url = `${PUZZEL_API_BASE_URL}/${connection.tenantId}${path}?${params}`

  const upstream = await fetch(url, {
    headers: { Authorization: `Bearer ${connection.token}` },
  })
  const body = await upstream.text()
  res.status(upstream.status).type('application/json').send(body)
  return true
}

export const puzzelRouter = Router()

puzzelRouter.use(requireBearerToken)

// Mirrors VisualQueueStateAndTickerList: GET /{customerKey}/visualqueues/stateinformation/{result}
puzzelRouter.get(
  '/:customerKey/visualqueues/stateinformation/:result',
  async (req, res) => {
    const proxied = await proxyToRealPuzzel(
      `/visualqueues/stateinformation/${req.params.result}`,
      {},
      res
    )
    if (proxied) return

    res.json({ result: queues, code: 0, id: 'mock', message: 'OK' })
  }
)

// Mirrors AgentStateAndTickerList: GET /{customerKey}/users/stateinformation/{tickerPeriodWindow}
puzzelRouter.get(
  '/:customerKey/users/stateinformation/:tickerPeriodWindow',
  async (req, res) => {
    const { userGroupName } = req.query

    const proxied = await proxyToRealPuzzel(
      `/users/stateinformation/${req.params.tickerPeriodWindow}`,
      typeof userGroupName === 'string' ? { userGroupName } : {},
      res
    )
    if (proxied) return

    const filtered =
      typeof userGroupName === 'string' && userGroupName
        ? agents.filter((agent) => agent.userGroupName === userGroupName)
        : agents
    res.json({ result: filtered, code: 0, id: 'mock', message: 'OK' })
  }
)

// Mirrors VisualQueueList: GET /{customerKey}/visualqueues
puzzelRouter.get('/:customerKey/visualqueues', async (_req, res) => {
  const proxied = await proxyToRealPuzzel('/visualqueues', {}, res)
  if (proxied) return

  const result = queues.map(({ id, description }) => ({ id, description }))
  res.json({ result, code: 0, id: 'mock', message: 'OK' })
})
