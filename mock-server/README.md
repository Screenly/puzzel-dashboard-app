# Mock Server

Fakes the Puzzel Contact Centre REST API real-time endpoints, under `/puzzel`,
so the Edge App can be developed and demoed without a paid Puzzel account.
Response shapes are based on Puzzel's published OpenAPI schema for the
`Real-time` tag, from [developer.puzzel.com](https://developer.puzzel.com/).
It also fakes the not-yet-built Screenly OAuth broker for Puzzel, under
`/screenly`.

## Getting Started

```bash
bun install
bun run dev
```

Open `http://localhost:3000` to see the current mock queues and agents, and
to cycle an agent's status (Ready → Paused → Logged Off) by clicking its
tile. Numbers on the queues also jitter automatically every 5 seconds so a
running dashboard shows movement.

## Connecting to real Puzzel data

By default the server serves synthetic data. To have it proxy real data from
your Puzzel account instead, copy `.env.example` to `.env` and fill in:

```
PUZZEL_CLIENT_KEY=...
PUZZEL_CLIENT_SECRET=...
PUZZEL_TENANT_ID=...
PUZZEL_USER_ID=...
```

Then click **Connect** on `http://localhost:3000`. This exchanges those
credentials for a real Puzzel ID access token (client-credentials grant,
`scope=contact-centre:{tenantId}:{userId}`), stores it in a local `auth.db`
SQLite file, and refreshes it automatically before it expires. Once
connected, `/puzzel/...` and `/screenly/access_token/` proxy real requests to
Puzzel instead of returning synthetic data. Click **Disconnect** to go back
to synthetic data.

`.env` and `auth.db` are gitignored — never commit real credentials or
tokens.

## Endpoints

| Endpoint                                                              | Mirrors                                                                        |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `GET /`                                                               | Admin UI: inspect mock data, Connect/Disconnect                                |
| `POST /connect`                                                       | Admin-only: exchanges env credentials for a real token                         |
| `POST /disconnect`                                                    | Admin-only: clears the stored real token                                       |
| `GET /puzzel/:customerKey/visualqueues/stateinformation/:result`      | `VisualQueueStateAndTickerList` (real when connected)                          |
| `GET /puzzel/:customerKey/users/stateinformation/:tickerPeriodWindow` | `AgentStateAndTickerList` (real when connected)                                |
| `GET /puzzel/:customerKey/visualqueues`                               | `VisualQueueList` (real when connected)                                        |
| `GET /screenly/access_token/`                                         | The not-yet-built Screenly OAuth broker for Puzzel (real token when connected) |
| `POST /admin/agents/:userId/cycle-status`                             | Admin-only: cycles an agent's status (synthetic mode only)                     |

All `/puzzel` endpoints require an `Authorization: Bearer <any-value>`
header — the mock does not validate the token itself, it only checks that
one was sent. When connected, the `:customerKey` and `:tickerPeriodWindow`
path segments are passed through to the real API as-is, but the tenant and
`userId` used in the upstream request always come from the connected
credentials, not from the incoming request.

## Connecting to the Edge App

In `mock-data.yml` (at the repository root), set:

```yaml
settings:
  access_token: 'mock-token'
  api_base_url: 'http://localhost:3000/puzzel'
  customer_key: '12345'
  screenly_oauth_tokens_url: 'http://localhost:3000/screenly/'
  screenly_app_auth_token: 'mock-token'
```
