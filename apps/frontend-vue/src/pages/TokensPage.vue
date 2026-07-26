<script setup lang="ts">
import { useColorMode } from '@/composables/useColorMode'
import Button from '@/components/ui/Button.vue'

/**
 * Dev-only swatch sheet used to verify the Tailwind v4 token port against the RN
 * app's gluestack palette. Reachable at /__tokens in development only.
 */
const { colorMode, setColorMode } = useColorMode()

const families = [
  'primary', 'secondary', 'tertiary', 'error', 'success',
  'warning', 'info', 'typography', 'outline', 'background',
]
const shades = ['0', '50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950']

const shadows = ['hard-1', 'hard-2', 'hard-3', 'hard-4', 'hard-5', 'soft-1', 'soft-2', 'soft-3', 'soft-4']
</script>

<template>
  <div class="min-h-dvh bg-background-0 p-8">
    <header class="mb-8 flex items-center gap-4">
      <h1 class="text-2xl font-bold text-typography-900">
        Design tokens
      </h1>
      <Button size="sm" variant="outline" @click="setColorMode(colorMode === 'dark' ? 'light' : 'dark')">
        {{ colorMode === 'dark' ? 'Light' : 'Dark' }}
      </Button>
    </header>

    <section v-for="family in families" :key="family" class="mb-6">
      <h2 class="mb-2 text-sm font-semibold text-typography-700">
        {{ family }}
      </h2>
      <div class="flex flex-wrap gap-1">
        <div v-for="shade in shades" :key="shade" class="w-16">
          <div
            class="h-12 rounded border border-outline-200"
            :class="`bg-${family}-${shade}`"
          />
          <p class="mt-1 text-2xs text-typography-500">
            {{ shade }}
          </p>
        </div>
      </div>
    </section>

    <section class="mb-6">
      <h2 class="mb-2 text-sm font-semibold text-typography-700">
        Shadows
      </h2>
      <div class="flex flex-wrap gap-4">
        <div
          v-for="shadow in shadows"
          :key="shadow"
          class="flex size-24 items-center justify-center rounded-lg bg-background-0 text-2xs text-typography-600"
          :class="`shadow-${shadow}`"
        >
          {{ shadow }}
        </div>
      </div>
    </section>

    <section>
      <h2 class="mb-2 text-sm font-semibold text-typography-700">
        Buttons
      </h2>
      <div class="flex flex-wrap gap-2">
        <Button variant="solid">
          Solid
        </Button>
        <Button variant="outline">
          Outline
        </Button>
        <Button variant="ghost">
          Ghost
        </Button>
        <Button variant="danger">
          Danger
        </Button>
        <Button variant="link">
          Link
        </Button>
        <Button loading>
          Loading
        </Button>
      </div>
    </section>
  </div>
</template>
