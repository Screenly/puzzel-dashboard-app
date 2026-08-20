# Puzzel Dashboard App

Puzzel Dashboard App - Screenly Edge App

## Getting Started

Install dependencies:

```bash
bun install
```

## Development

```bash
bun run dev
```

Styling uses [Tailwind CSS](https://tailwindcss.com/) utility classes, enabled via the `tailwindcss/theme.css` and `tailwindcss/utilities.css` imports in `src/style.css`. Inside `<auto-scaler>`, use `h-full`/`w-full` rather than `h-screen`/`w-screen` — see the [`@screenly/edge-apps` README](https://github.com/Screenly/edge-apps-library#styling-with-tailwind-css) for details.

## Build

```bash
bun run build
```

## Deployment

```bash
screenly edge-app create --name puzzel-dashboard-app --in-place
bun run deploy
screenly edge-app instance create
```

## Configuration

Settings are defined in `screenly.yml` and mirrored in `screenly_qc.yml` (used for the QC/staging build).

| Setting             | Description                                                                                                 | Required | Default |
| ------------------- | ----------------------------------------------------------------------------------------------------------- | -------- | ------- |
| `access_token`      | For testing only. Production support for Puzzel ID OAuth is not implemented yet.                            | No       | —       |
| `customer_key`      | Your Puzzel customer number.                                                                                | Yes      | —       |
| `display_errors`    | For debugging purposes to display errors on the screen.                                                     | No       | `false` |
| `override_locale`   | Override the default locale with a supported language code (e.g., en_US, fr_FR, de_DE).                     | No       | `en`    |
| `override_timezone` | Override the default timezone with a supported timezone identifier (e.g., Europe/London, America/New_York). | No       | —       |
| `refresh_interval`  | How often to refresh dashboard data, in seconds.                                                            | No       | `15`    |
| `sentry_dsn`        | Sentry Client Key from Sentry SDK for error capturing.                                                      | No       | —       |
| `user_group_name`   | Filter agent statuses to a specific Puzzel user group. Leave blank to show all agents.                      | No       | —       |
| `user_id`           | The Puzzel user ID associated with your OIDC client's Product Access. Required for API requests to succeed. | Yes      | —       |

## Screenshots

```bash
bun run screenshots
```
