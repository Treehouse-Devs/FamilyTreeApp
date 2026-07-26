<script setup lang="ts">
import { computed } from 'vue'
import { BaseEdge, getStraightPath } from '@vue-flow/core'

const props = defineProps<{
  id: string
  sourceX: number
  sourceY: number
  targetX: number
  targetY: number
}>()

/**
 * The horizontal connector between partners — a straight line between the two
 * cards' facing edges, matching the RN renderer's couple path.
 */
const path = computed(() => getStraightPath({
  sourceX: props.sourceX,
  sourceY: props.sourceY,
  targetX: props.targetX,
  targetY: props.targetY,
})[0])
</script>

<template>
  <BaseEdge :id="id" :path="path" :style="{ strokeWidth: 2 }" />
</template>
