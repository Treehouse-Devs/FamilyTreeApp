<script setup lang="ts">
import { Label } from 'reka-ui'

/**
 * Equivalent of the RN app's gluestack `form-control`: label, control slot, and a
 * reserved line for the validation message so the layout doesn't jump.
 */
defineProps<{
  label?: string
  error?: string
  for?: string
}>()
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <Label v-if="label" :for="$props.for" class="text-sm font-medium text-typography-700">
      {{ label }}
    </Label>

    <slot />

    <p v-if="error" class="text-xs text-error-600">
      {{ error }}
    </p>
  </div>
</template>
