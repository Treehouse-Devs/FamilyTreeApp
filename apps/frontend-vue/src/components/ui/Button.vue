<script setup lang="ts">
import { computed } from 'vue'
import { Primitive } from 'reka-ui'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import { Loader2 } from '@lucide/vue'
import { cn } from '@/lib/utils'

/**
 * shadcn-vue style: a Reka UI primitive plus a cva recipe, using the same design
 * tokens as the RN app's gluestack Button — `primary-500` fill, `typography-0`
 * text — so the two apps look alike during the migration.
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indicator-info disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        solid: 'bg-primary-500 text-typography-0 hover:bg-primary-600 active:bg-primary-700',
        outline: 'border border-outline-300 bg-transparent text-typography-800 hover:bg-background-100',
        ghost: 'bg-transparent text-typography-700 hover:bg-background-100',
        link: 'bg-transparent text-primary-600 underline-offset-4 hover:underline',
        danger: 'bg-error-500 text-typography-0 hover:bg-error-600',
      },
      size: {
        sm: 'h-9 px-3',
        md: 'h-11 px-4',
        lg: 'h-12 px-6 text-base',
        icon: 'size-10',
      },
      block: {
        true: 'w-full',
      },
    },
    defaultVariants: { variant: 'solid', size: 'md' },
  },
)

type ButtonVariants = VariantProps<typeof buttonVariants>

const props = withDefaults(defineProps<{
  variant?: ButtonVariants['variant']
  size?: ButtonVariants['size']
  block?: boolean
  loading?: boolean
  disabled?: boolean
  as?: string
  class?: string
}>(), { as: 'button' })

const classes = computed(() =>
  cn(buttonVariants({ variant: props.variant, size: props.size, block: props.block }), props.class),
)
</script>

<template>
  <Primitive :as="as" :class="classes" :disabled="disabled || loading">
    <Loader2 v-if="loading" class="size-4 animate-spin" />
    <slot />
  </Primitive>
</template>
