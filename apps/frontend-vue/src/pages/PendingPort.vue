<script setup lang="ts">
import { Construction } from '@lucide/vue'

/**
 * Placeholder for screens not yet ported.
 *
 * The scaffold deliberately implements one vertical slice end to end (sign-in ->
 * tree list -> tree canvas) rather than half-building every screen. These routes
 * exist so the router table and navigation are complete and testable; each is
 * replaced during the screen-by-screen phase.
 */
defineProps<{ screen: string, source: string }>()
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-3 py-20 text-center">
    <Construction class="size-10 text-typography-300" />
    <h2 class="text-lg font-semibold text-typography-800">
      {{ screen }}
    </h2>
    <p class="max-w-sm text-sm text-typography-600">
      Not ported yet. Port from <code class="rounded bg-background-100 px-1">{{ source }}</code>.
    </p>
  </div>
</template>
