<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import PendingPort from '../PendingPort.vue'

const { t } = useI18n()
</script>

<template>
  <div class="min-h-dvh bg-background-0 px-6 py-12">
    <div class="mx-auto w-full max-w-sm">
      <PendingPort :screen="t('resetPassword')" source="apps/frontend/app/auth/forget-password.tsx" />
      <RouterLink :to="{ name: 'signin' }" class="mt-4 block text-center text-sm text-primary-600 hover:underline">
        {{ t('signin') }}
      </RouterLink>
    </div>
  </div>
</template>
