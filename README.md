# Puzzel Dashboard App

Puzzel Dashboard App - Screenly Edge App

## Getting Started

Clone the repository and install dependencies:

```bash
gh repo clone Screenly/puzzel-dashboard-app -- --recurse-submodules
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

| Setting   | Description                     | Required | Default            |
| --------- | ------------------------------- | -------- | ------------------ |
| `message` | The message displayed on screen | No       | `Hello, Screenly!` |

## Screenshots

```bash
bun run screenshots
```
