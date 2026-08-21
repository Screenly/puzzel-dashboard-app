# Mock Server

Acts as a Screenly OAuth broker stand-in for Puzzel, under `/screenly`, and
an authenticated pass-through to the real Puzzel Contact Centre REST API,
under `/puzzel`. Response shapes are based on Puzzel's published OpenAPI
schema for the `Real-time` tag, from
[developer.puzzel.com](https://developer.puzzel.com/). Both require a real
Puzzel account — there is no synthetic/offline mode.

## Getting Started

```bash
bun install
bun run dev
```

Open `http://localhost:3000` to connect.

## Connecting to real Puzzel data

Copy `.env.example` to `.env` and fill in:

```
PUZZEL_CLIENT_KEY=...
PUZZEL_CLIENT_SECRET=...
PUZZEL_TENANT_ID=...
PUZZEL_USER_ID=...
```

Then click **Connect** on `http://localhost:3000`. This exchanges those
credentials for a real Puzzel ID access token (client-credentials grant,
`scope=contact-centre:{tenantId}:{userId}`), stores it in a local `auth.db`
SQLite file, and refreshes it automatically before it expires. Click
**Disconnect** to clear it.

`.env` and `auth.db` are gitignored — never commit real credentials or
tokens.

## Endpoints

| Endpoint                                                              | Mirrors                                                                        |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `GET /`                                                               | Admin UI: Connect/Disconnect                                                   |
| `POST /connect`                                                       | Admin-only: exchanges env credentials for a real token                         |
| `POST /disconnect`                                                    | Admin-only: clears the stored real token                                       |
| `GET /puzzel/:customerKey/visualqueues/stateinformation/:result`      | `VisualQueueStateAndTickerList`                                                |
| `GET /puzzel/:customerKey/users/stateinformation/:tickerPeriodWindow` | `AgentStateAndTickerList`                                                      |
| `GET /puzzel/:customerKey/visualqueues`                               | `VisualQueueList`                                                              |
| `GET /screenly/access_token/`                                         | The not-yet-built Screenly OAuth broker for Puzzel (real token when connected) |

All `/puzzel` endpoints require an `Authorization: Bearer <any-value>`
header — the mock does not validate the token itself, it only checks that
one was sent — and require an active Connect session, returning 404
otherwise. The `:customerKey` and `:tickerPeriodWindow` path segments are
passed through to the real API as-is, but the tenant and `userId` used in
the upstream request always come from the connected credentials, not from
the incoming request.

## Connecting to the Edge App

The Edge App's Puzzel API base URL is hardcoded to the real Puzzel API and is
no longer configurable via settings, so `/puzzel/...` is not wired into the
running dashboard — use it for manual `curl`/browser checks instead. The
`/screenly` broker can still be pointed at from `mock-data.yml` (at the
repository root):

```yaml
settings:
  access_token: 'mock-token'
  customer_key: '12345'
  screenly_oauth_tokens_url: 'http://localhost:3000/screenly/'
  screenly_app_auth_token: 'mock-token'
```
