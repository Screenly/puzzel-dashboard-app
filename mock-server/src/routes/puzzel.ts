import { Router, type NextFunction, type Request, type Response } from 'express'
import { PUZZEL_API_BASE_URL } from '../constants'
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

async function callPuzzel(
  path: string,
  query: Record<string, string>,
  res: Response
): Promise<void> {
  const connection = getConnection()
  if (!connection) {
    res.status(404).json({ error: 'Not connected. Visit / to connect.' })
    return
  }

  const params = new URLSearchParams(query)
  params.set('userId', connection.userId)
  const url = `${PUZZEL_API_BASE_URL}/${connection.tenantId}${path}?${params}`

  try {
    const upstream = await fetch(url, {
      headers: { Authorization: `Bearer ${connection.token}` },
    })
    const body = await upstream.text()
    res.status(upstream.status).type('application/json').send(body)
  } catch (err) {
    res.status(502).json({
      error: 'Failed to reach Puzzel.',
      message: err instanceof Error ? err.message : String(err),
    })
  }
}

export const puzzelRouter = Router()

puzzelRouter.use(requireBearerToken)

// Mirrors VisualQueueStateAndTickerList: GET /{customerKey}/visualqueues/stateinformation/{result}
puzzelRouter.get(
  '/:customerKey/visualqueues/stateinformation/:result',
  async (req, res) => {
    await callPuzzel(
      `/visualqueues/stateinformation/${req.params.result}`,
      {},
      res
    )
  }
)

// Mirrors AgentStateAndTickerList: GET /{customerKey}/users/stateinformation/{tickerPeriodWindow}
puzzelRouter.get(
  '/:customerKey/users/stateinformation/:tickerPeriodWindow',
  async (req, res) => {
    const { userGroupName } = req.query

    await callPuzzel(
      `/users/stateinformation/${req.params.tickerPeriodWindow}`,
      typeof userGroupName === 'string' ? { userGroupName } : {},
      res
    )
  }
)

// Mirrors VisualQueueList: GET /{customerKey}/visualqueues
puzzelRouter.get('/:customerKey/visualqueues', async (_req, res) => {
  await callPuzzel('/visualqueues', {}, res)
})
