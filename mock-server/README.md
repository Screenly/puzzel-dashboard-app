# Mock Server

Fakes the Puzzel Contact Centre REST API real-time endpoints so the Edge App
can be developed and demoed without a paid Puzzel account. Response shapes
are based on Puzzel's published OpenAPI schema for the `Real-time` tag.

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

| Endpoint                                                        | Mirrors                          |
| ----------------------------------------------------------------| --------------------------------- |
| `GET /`                                                          | Admin UI for inspecting mock data |
| `GET /:customerKey/visualqueues/stateinformation/:result`        | `VisualQueueStateAndTickerList`   |
| `GET /:customerKey/users/stateinformation/:tickerPeriodWindow`   | `AgentStateAndTickerList`         |
| `GET /:customerKey/visualqueues`                                 | `VisualQueueList`                 |
| `POST /admin/agents/:userId/cycle-status`                        | Admin-only: cycles an agent's status |

All `Real-time` endpoints require an `Authorization: Bearer <any-value>`
header — the mock does not validate the token itself, it only checks that
one was sent.

## Connecting to the Edge App

In `mock-data.yml` (at the repository root), set:

```yaml
settings:
  access_token: 'mock-token'
  api_base_url: 'http://localhost:3000'
  customer_key: '12345'
```
