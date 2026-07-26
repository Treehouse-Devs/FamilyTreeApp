<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import AppShell from '@/layouts/AppShell.vue'
import PendingPort from '@/pages/PendingPort.vue'

const { t } = useI18n()
</script>

<template>
  <AppShell>
    <template #title>
      {{ t('details') }}
    </template>
    <PendingPort :screen="t('details')" source="apps/frontend/app/(authenticated)/tree/[id]/details/[personId]/index.tsx" />
  </AppShell>
</template>
