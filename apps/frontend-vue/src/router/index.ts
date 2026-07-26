import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { installGuards } from './guards'

/**
 * Explicit route table mirroring the RN app's expo-router tree.
 *
 * The RN layouts are all bare `<Slot />` — no Stack, no Tabs — so there is nothing
 * to reproduce beyond the URL shapes and the auth gate. `meta.requiresAuth` stands
 * in for the `(authenticated)` route group, and is enforced in `./guards.ts`.
 */
export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'welcome',
    component: () => import('@/pages/WelcomePage.vue'),
    meta: { public: true },
  },
  {
    path: '/auth/signin',
    name: 'signin',
    component: () => import('@/pages/auth/SignInPage.vue'),
    meta: { public: true },
  },
  {
    path: '/auth/signup',
    name: 'signup',
    component: () => import('@/pages/auth/SignUpPage.vue'),
    meta: { public: true },
  },
  {
    path: '/auth/forget-password',
    name: 'forget-password',
    component: () => import('@/pages/auth/ForgetPasswordPage.vue'),
    meta: { public: true },
  },

  // Authenticated area — `app/(authenticated)/**` in the RN app.
  {
    path: '/trees',
    name: 'trees',
    component: () => import('@/pages/authenticated/TreeListPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/trees/:id',
    name: 'tree',
    component: () => import('@/pages/authenticated/tree/TreePage.vue'),
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: '/trees/:id/members',
    name: 'tree-members',
    component: () => import('@/pages/authenticated/tree/MembersPage.vue'),
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: '/trees/:id/person/:personId',
    name: 'person-detail',
    component: () => import('@/pages/authenticated/tree/PersonDetailPage.vue'),
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/pages/authenticated/SettingsPage.vue'),
    meta: { requiresAuth: true },
  },

  // Dev-only swatch sheet for checking the ported design tokens against the RN app.
  ...(import.meta.env.DEV
    ? [{
      path: '/__tokens',
      name: 'tokens',
      component: () => import('@/pages/TokensPage.vue'),
      // `standalone` opts out of the auth-screen redirect so it stays reachable
      // whether or not you happen to be signed in.
      meta: { public: true, standalone: true },
    } satisfies RouteRecordRaw]
    : []),

  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  // History mode works both on the desktop web host and inside Capacitor, which
  // serves the bundle from http://localhost.
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: (_to, _from, saved) => saved ?? { top: 0 },
})

installGuards(router)

export default router
