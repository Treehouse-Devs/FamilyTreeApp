# frontend-vue

Vue 3 + Vite + Capacitor frontend. An in-progress migration of `apps/frontend`
(React Native + Expo), which stays intact and shipping throughout.

One codebase serves both targets: the Capacitor mobile shell and the desktop web
app differ only in CSS, swapping `MobileShell` / `DesktopShell` at Tailwind's `md`
breakpoint (see `src/composables/usePlatform.ts`).

## Stack

| Concern | Choice | Replaces (RN) |
|---|---|---|
| Build | Vite 8 | Metro + Babel |
| Routing | vue-router 5, explicit route table | expo-router |
| State | Pinia + `pinia-plugin-persistedstate` | Zustand + persist |
| Server state | TanStack Query | `useApi` proxy hook |
| Styling | Tailwind v4 (`@theme`) | NativeWind + Tailwind 3 |
| UI | shadcn-vue style: Reka UI + cva | gluestack-ui v3 |
| Tree canvas | Vue Flow | `@shopify/react-native-skia` |
| Forms | VeeValidate + zod | react-hook-form + zod |
| i18n | vue-i18n | i18next |
| Native | Capacitor 8 | Expo modules |

## Layout

```
src/
├── components/family-tree/  tree renderer — layout algorithm + Vue Flow nodes/edges
├── components/ui/           owned UI primitives (shadcn-vue style)
├── composables/queries/     TanStack Query wrappers over services/
├── layouts/                 MobileShell / DesktopShell / AppShell
├── lib/                     axios client, token storage, query client, Capacitor init
├── pages/                   screens, foldered to mirror the RN app/ tree
├── router/                  route table + auth guard
├── services/                API service classes (ported ~verbatim)
├── stores/                  Pinia: app, auth, user, tree
└── mocks/                   mock API, enabled with VITE_MOCK_DATA=true
```

## Commands

```bash
yarn dev          # dev server
yarn test         # Vitest
yarn typecheck    # vue-tsc
yarn build        # typecheck + production build
yarn cap:sync     # build + npx cap sync
```

## Environment

Copy `.env.example` to `.env.local`:

- `VITE_API_URL` — backend base URL
- `VITE_MOCK_DATA` — `true` serves `src/mocks` instead of hitting the API

## Notes for porting the remaining screens

- Screens marked with `PendingPort.vue` list the RN file to port from.
- Tailwind class names are identical to the RN app — the design tokens were ported
  verbatim — so markup can usually be copied and re-tagged from RN primitives to HTML.
- Import DTOs from `@treely/dto/client`, not `@treely/dto`: the default entry pulls in
  `reflect-metadata` and class-validator decorators (~39 KB) that a browser build has no
  use for.
- `src/utils/date.ts` and everything under `src/stores/tree-utils.ts` are straight copies
  from the RN app; keep them in sync until they move to a shared package.
