<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  modelValue?: string | number
  invalid?: boolean
  class?: string
}>()

defineEmits<{ 'update:modelValue': [value: string] }>()

const classes = computed(() => cn(
  'flex h-11 w-full rounded-lg border bg-background-0 px-3 text-sm text-typography-900 placeholder:text-typography-400 focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50',
  props.invalid
    ? 'border-error-500 focus-visible:ring-error-400'
    : 'border-outline-200 focus-visible:ring-primary-400',
  props.class,
))
</script>

<template>
  <input
    :value="modelValue"
    :class="classes"
    :aria-invalid="invalid || undefined"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  >
</template>
