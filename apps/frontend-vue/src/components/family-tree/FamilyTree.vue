<script setup lang="ts">
import { watch } from 'vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import type { NodeMouseEvent } from '@vue-flow/core'
import type { Person } from '@/types/tree'
import { useTreeLayout } from './useTreeLayout'
import { JUNCTION_PREFIX, NODE_H, NODE_W } from './types'
import type { PersonNodeData } from './types'
import PersonNode from './PersonNode.vue'
import JunctionNode from './JunctionNode.vue'
import CoupleEdge from './CoupleEdge.vue'

import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/controls/dist/style.css'

const props = withDefaults(defineProps<{
  root?: Person
  minZoom?: number
  maxZoom?: number
}>(), {
  minZoom: 0.5,
  maxZoom: 3,
})

const emit = defineEmits<{
  pressNode: [person: Person]
  zoomChange: [zoom: number]
}>()

const { nodes, edges } = useTreeLayout(() => props.root)

const { fitView, setCenter, getViewport, onViewportChange } = useVueFlow()

onViewportChange(viewport => emit('zoomChange', viewport.zoom))

// Re-frame whenever a different tree is loaded.
watch(nodes, async (value) => {
  if (value.length === 0) return
  await fitView({ padding: 0.2, maxZoom: 1 })
}, { immediate: true, flush: 'post' })

function handleNodeClick({ node }: NodeMouseEvent) {
  // Junction nodes are layout scaffolding, not people.
  if (node.id.startsWith(JUNCTION_PREFIX)) return

  const data = node.data as PersonNodeData | undefined
  if (!data?.person) return

  emit('pressNode', data.person)
}

/**
 * Replaces the imperative `focusOnNode` the RN component exposed through a ref —
 * there it animated Reanimated shared values by hand; here Vue Flow owns the
 * viewport transform.
 */
async function focusOnNode(nodeId: string) {
  const node = nodes.value.find(n => n.id === nodeId)
  if (!node) return

  await setCenter(
    node.position.x + NODE_W / 2,
    node.position.y + NODE_H / 2,
    { zoom: Math.max(getViewport().zoom, 1), duration: 400 },
  )
}

defineExpose({ focusOnNode, fitView })
</script>

<template>
  <VueFlow
    :nodes="nodes"
    :edges="edges"
    :min-zoom="minZoom"
    :max-zoom="maxZoom"
    :nodes-draggable="false"
    :nodes-connectable="false"
    :edges-updatable="false"
    :elevate-edges-on-select="false"
    fit-view-on-init
    class="size-full bg-transparent"
    @node-click="handleNodeClick"
  >
    <!-- Pan, pinch and wheel zoom come from the Vue Flow viewport, which is why
         the RN app's 252-line gesture/worklet hook has no equivalent here. -->
    <template #node-person="personNodeProps">
      <PersonNode v-bind="personNodeProps" />
    </template>

    <template #node-junction>
      <JunctionNode />
    </template>

    <template #edge-couple="coupleEdgeProps">
      <CoupleEdge v-bind="coupleEdgeProps" />
    </template>

    <Background :gap="24" :size="1" class="opacity-40" />
    <Controls :show-interactive="false" />
  </VueFlow>
</template>

<style scoped>
/* Edges inherit the primary token so they track light/dark like everything else. */
.size-full :deep(.vue-flow__edge-path),
.size-full :deep(.vue-flow__connection-path) {
  stroke: rgb(var(--rgb-primary-800));
}
</style>
