<script setup lang="ts">
import { useColorMode } from '@/composables/useColorMode'

// Keeps the `.dark` class on <html> in sync with the app store, which is what the
// Tailwind theme's dark variant reads.
useColorMode()
</script>

<template>
  <RouterView />
</template>
