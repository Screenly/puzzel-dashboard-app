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

## Endpoints

| Endpoint                                                              | Mirrors                              |
| ---------------------------------------------------------------------| ------------------------------------- |
| `GET /`                                                               | Admin UI for inspecting mock data     |
| `GET /puzzel/:customerKey/visualqueues/stateinformation/:result`      | `VisualQueueStateAndTickerList`       |
| `GET /puzzel/:customerKey/users/stateinformation/:tickerPeriodWindow` | `AgentStateAndTickerList`             |
| `GET /puzzel/:customerKey/visualqueues`                               | `VisualQueueList`                     |
| `GET /screenly/access_token/`                                         | The not-yet-built Screenly OAuth broker for Puzzel |
| `POST /admin/agents/:userId/cycle-status`                             | Admin-only: cycles an agent's status  |

All `/puzzel` endpoints require an `Authorization: Bearer <any-value>`
header — the mock does not validate the token itself, it only checks that
one was sent.

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
