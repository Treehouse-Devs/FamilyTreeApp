<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Settings, TreePine } from '@lucide/vue'

const route = useRoute()
const { t } = useI18n()

const navItems = computed(() => [
  { name: 'trees', icon: TreePine, label: t('familyTree') },
  { name: 'settings', icon: Settings, label: t('settings') },
])
</script>

<template>
  <div class="flex min-h-dvh bg-background-0">
    <aside
      class="sticky top-0 flex h-dvh w-60 shrink-0 flex-col border-r border-outline-100 bg-background-50 px-3 py-6"
    >
      <RouterLink
        :to="{ name: 'trees' }"
        class="mb-8 flex items-center gap-2 px-3 text-lg font-bold text-primary-700"
      >
        <TreePine class="size-6" />
        {{ t('appName') }}
      </RouterLink>

      <nav class="flex flex-col gap-1">
        <RouterLink
          v-for="item in navItems"
          :key="item.name"
          :to="{ name: item.name }"
          class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
          :class="route.name === item.name
            ? 'bg-primary-100 text-primary-800'
            : 'text-typography-600 hover:bg-background-100'"
        >
          <component :is="item.icon" class="size-5" />
          {{ item.label }}
        </RouterLink>
      </nav>
    </aside>

    <div class="flex min-w-0 flex-1 flex-col">
      <header class="border-b border-outline-100 px-8">
        <div class="flex h-16 items-center gap-3">
          <h1 class="truncate text-xl font-semibold text-typography-900">
            <slot name="title" />
          </h1>
          <div class="ml-auto flex items-center gap-2">
            <slot name="actions" />
          </div>
        </div>
      </header>

      <main class="mx-auto w-full max-w-5xl flex-1 px-8 py-6">
        <slot />
      </main>
    </div>
  </div>
</template>
