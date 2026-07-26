<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ChevronLeft, Settings, TreePine } from '@lucide/vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

/** Mirrors the RN app's hand-built `components/custom/action-bar`. */
const showBack = computed(() => route.name !== 'trees')

const navItems = computed(() => [
  { name: 'trees', icon: TreePine, label: t('familyTree') },
  { name: 'settings', icon: Settings, label: t('settings') },
])
</script>

<template>
  <div class="flex min-h-dvh flex-col bg-background-0">
    <header
      class="pt-safe sticky top-0 z-20 border-b border-outline-100 bg-background-0/95 backdrop-blur"
    >
      <div class="flex h-14 items-center gap-2 px-4">
        <button
          v-if="showBack"
          type="button"
          class="-ml-2 rounded-full p-2 text-typography-700 active:bg-background-100"
          :aria-label="t('back')"
          @click="router.back()"
        >
          <ChevronLeft class="size-5" />
        </button>
        <h1 class="truncate text-base font-semibold text-typography-900">
          <slot name="title" />
        </h1>
        <div class="ml-auto flex items-center gap-1">
          <slot name="actions" />
        </div>
      </div>
    </header>

    <main class="flex-1">
      <slot />
    </main>

    <nav
      class="pb-safe sticky bottom-0 z-20 border-t border-outline-100 bg-background-0"
      :aria-label="t('familyTree')"
    >
      <ul class="flex">
        <li v-for="item in navItems" :key="item.name" class="flex-1">
          <RouterLink
            :to="{ name: item.name }"
            class="flex flex-col items-center gap-1 py-2 text-2xs"
            :class="route.name === item.name
              ? 'text-primary-600'
              : 'text-typography-500'"
          >
            <component :is="item.icon" class="size-5" />
            {{ item.label }}
          </RouterLink>
        </li>
      </ul>
    </nav>
  </div>
</template>
