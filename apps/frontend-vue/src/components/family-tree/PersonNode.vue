<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Handle, Position } from '@vue-flow/core'
import { Gender } from '@treely/dto/client'
import { getAgeInfo, getYear } from '@/utils/date'
import type { PersonNodeData } from './types'
import { NODE_H, NODE_W } from './types'

const props = defineProps<{ data: PersonNodeData, selected?: boolean }>()

const { t } = useI18n()

const person = computed(() => props.data.person)

/**
 * The RN card drew this text with Skia, measuring glyph widths by hand to centre
 * it. In the DOM it is just a centred element, so the measurement code is gone.
 */
const ageInfo = computed(() =>
  getAgeInfo(person.value.birthDate, person.value.deathDate, t),
)

const birthYear = computed(() => getYear(person.value.birthDate))

// Same dummy portraits the RN card falls back to, copied into public/.
const fallbackAvatar = computed(() =>
  person.value.gender === Gender.FEMALE ? '/avatars/female.webp' : '/avatars/male.webp',
)

/** A dead remote thumbnail should degrade to the dummy, not a broken-image icon. */
function onImageError(event: Event) {
  const img = event.target as HTMLImageElement
  if (img.src !== fallbackAvatar.value) img.src = fallbackAvatar.value
}
</script>

<template>
  <!-- Handles are the anchor points Vue Flow routes edges between; they carry no
       visuals of their own. -->
  <Handle id="top" type="target" :position="Position.Top" class="!opacity-0" />
  <Handle id="left" type="target" :position="Position.Left" class="!opacity-0" />
  <Handle id="right" type="source" :position="Position.Right" class="!opacity-0" />

  <div
    class="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-secondary-500 bg-secondary-0 px-3 text-center transition-colors"
    :class="selected ? 'bg-secondary-50' : 'hover:bg-secondary-50'"
    :style="{ width: `${NODE_W}px`, height: `${NODE_H}px` }"
  >
    <img
      :src="person.imageThumbnailUrl || fallbackAvatar"
      :alt="person.name"
      class="size-9 rounded-full border border-secondary-300 object-cover"
      loading="lazy"
      @error="onImageError"
    >
    <p class="w-full truncate text-sm font-semibold text-secondary-900">
      {{ person.name }}
    </p>
    <p class="text-2xs text-secondary-700">
      {{ birthYear }} · {{ ageInfo }}
    </p>
  </div>
</template>
