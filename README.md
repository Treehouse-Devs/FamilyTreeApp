# Family Tree Maker App Monorepo

This repository is a **monorepo** managed with [Turborepo](https://turbo.build/repo), containing the frontend and backend projects for the Family Tree Maker App.

---

## Project Structure

- `apps/frontend` — React Native app built with [Expo](https://expo.dev/)
- `apps/frontend-vue` — Vue 3 + Vite app, wrapped for mobile with [Capacitor](https://capacitorjs.com/) and served as the desktop web app
- `apps/backend` — Backend API built with [NestJS](https://nestjs.com/)
- `packages/dto` — Shared Data Transfer Objects (DTOs) used by every app

### Frontend migration

`apps/frontend-vue` is an in-progress migration of `apps/frontend` from React Native to Vue.
Both apps are live: the React Native app remains the shipping Android build and is not
being modified, while screens are ported across one at a time.

A single Vue codebase serves both form factors — the mobile (Capacitor) and desktop web
builds differ only in CSS, switching between `MobileShell` and `DesktopShell` at Tailwind's
`md` breakpoint.

```bash
yarn workspace frontend-vue dev        # dev server
yarn workspace frontend-vue test       # unit tests (Vitest)
yarn workspace frontend-vue build      # production build
yarn workspace frontend-vue cap:sync   # build + sync the Capacitor native project
```

Set `VITE_MOCK_DATA=true` in `apps/frontend-vue/.env.local` to run against the bundled
mock API instead of a live backend. In development, `/__tokens` renders a swatch sheet of
the design tokens for comparing against the React Native app.

---

## Getting Started

### Prerequisites (installed globally)

- [Node.js](https://nodejs.org/) (Recommended version: 22+)
- [Yarn](https://yarnpkg.com/) (v1 or v3+)
- [Expo CLI](https://docs.expo.dev/workflow/expo-cli/) (optional but recommended for React Native development)

### Installation

Clone the repository and install dependencies:

```bash
git clone <repo-url>
cd <repo-folder>
yarn install