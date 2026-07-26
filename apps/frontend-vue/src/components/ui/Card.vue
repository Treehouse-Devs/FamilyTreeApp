<script setup lang="ts">
import { computed } from 'vue'
import { Primitive } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = withDefaults(defineProps<{
  as?: string
  interactive?: boolean
  class?: string
}>(), { as: 'div' })

const classes = computed(() => cn(
  'rounded-xl border border-outline-100 bg-background-0 p-4 shadow-soft-1',
  props.interactive && 'cursor-pointer transition-colors hover:bg-background-50',
  props.class,
))
</script>

<template>
  <Primitive :as="as" :class="classes">
    <slot />
  </Primitive>
</template>
