<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import AppShell from '@/layouts/AppShell.vue'
import PendingPort from '@/pages/PendingPort.vue'

const { t } = useI18n()
</script>

<template>
  <AppShell>
    <template #title>
      {{ t('settings') }}
    </template>
    <PendingPort :screen="t('settings')" source="apps/frontend/app/(authenticated)/settings/index.tsx" />
  </AppShell>
</template>
