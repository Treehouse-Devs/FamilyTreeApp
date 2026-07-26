<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { TreePine } from '@lucide/vue'
import { useAppStore } from '@/stores/app'
import Button from '@/components/ui/Button.vue'

/**
 * Ported from `app/index.tsx`. The redirect half of that screen — logged in ->
 * trees, welcome already seen -> signin — now lives in `router/guards.ts`, so
 * this component is only the first-run splash.
 */
const { t } = useI18n()
const router = useRouter()
const app = useAppStore()

async function start() {
  app.setHasSeenWelcome(true)
  await router.push({ name: 'signin' })
}
</script>

<template>
  <div class="flex min-h-dvh flex-col items-center justify-center bg-linear-to-b from-primary-50 to-background-0 px-6 text-center">
    <TreePine class="size-16 text-primary-600" />

    <h1 class="mt-6 text-3xl font-bold text-typography-900">
      {{ t('appName') }}
    </h1>
    <p class="mt-3 max-w-sm text-base text-typography-700">
      {{ t('welcomeMessage') }}
    </p>
    <p class="mt-2 max-w-sm text-sm text-typography-600">
      {{ t('welcomeDescription') }}
    </p>

    <Button size="lg" class="mt-10 w-full max-w-xs" @click="start">
      {{ t('startCreating') }}
    </Button>

    <p class="mt-4 text-sm text-typography-600">
      {{ t('signinDescription') }}
      <RouterLink :to="{ name: 'signin' }" class="ml-1 font-semibold text-primary-600 hover:underline">
        {{ t('signin') }}
      </RouterLink>
    </p>
  </div>
</template>
