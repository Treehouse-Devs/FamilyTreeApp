<script setup lang="ts">
import { usePlatform } from '@/composables/usePlatform'
import DesktopShell from './DesktopShell.vue'
import MobileShell from './MobileShell.vue'

/**
 * The one place the mobile/desktop split is decided. Pages render inside whichever
 * shell matches the viewport and never branch on form factor themselves.
 */
const { isDesktop } = usePlatform()
</script>

<template>
  <component :is="isDesktop ? DesktopShell : MobileShell">
    <template #title>
      <slot name="title" />
    </template>
    <template #actions>
      <slot name="actions" />
    </template>
    <slot />
  </component>
</template>
