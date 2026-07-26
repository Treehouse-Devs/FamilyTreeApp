<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'

/**
 * A zero-size, invisible anchor sitting at a couple's midpoint.
 *
 * Vue Flow edges connect exactly two nodes, but the RN renderer drew children
 * hanging off the *couple*, not off one parent. Sourcing every child edge from
 * this node reproduces that shared drop line.
 */
</script>

<template>
  <div class="size-px opacity-0">
    <Handle id="bottom" type="source" :position="Position.Bottom" class="!opacity-0" />
  </div>
</template>
