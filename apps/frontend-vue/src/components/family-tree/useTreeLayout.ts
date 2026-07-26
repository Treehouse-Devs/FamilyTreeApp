import { computed, toValue } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import { Position } from '@vue-flow/core'
import type { Edge as FlowEdge, Node as FlowNode } from '@vue-flow/core'
import type { Person } from '@/types/tree'
import type { Edge, NodeLayout, PersonNodeData, TreeLayout } from './types'
import {
  H_GAP,
  H_GAP_COUPLE,
  NODE_H,
  NODE_W,
  PADDING_X,
  PADDING_Y,
  V_GAP,
  junctionId,
} from './types'

// --- Helper ------------------------------------------------------------------

/**
 * Calculate the width needed for a person's subtree (including spouse and children)
 */
const calculateSubtreeWidth = (person: Person): number => {
  const hasSpouse = !!person.spouse
  const coupleWidth = hasSpouse ? NODE_W * 2 + H_GAP_COUPLE : NODE_W

  if (!person.children || person.children.length === 0) {
    return coupleWidth
  }

  // Sum of all children subtree widths + gaps between them
  const childrenWidth = person.children.reduce((sum, child, index) => {
    const childWidth = calculateSubtreeWidth(child)
    const gap = index > 0 ? H_GAP : 0

    return sum + childWidth + gap
  }, 0)

  return Math.max(coupleWidth, childrenWidth)
}

// --- Layout ------------------------------------------------------------------

/**
 * Computes the DFS tree layout: positions every node and collects edges.
 *
 * Ported unchanged from the RN app's `useTreeLayout` — it never depended on Skia,
 * only on the shared constants. Kept as a plain function (rather than folded into
 * the composable) so it can be unit-tested against the same fixtures the RN app
 * uses; see `useTreeLayout.spec.ts`.
 */
export function computeTreeLayout(root: Person): TreeLayout {
  const nodeMap = new Map<string, NodeLayout>()
  const edgeList: Edge[] = []

  const layoutTree = (person: Person, depth: number, offsetX: number): number => {
    const subtreeWidth = calculateSubtreeWidth(person)
    const hasSpouse = !!person.spouse
    const coupleWidth = hasSpouse ? NODE_W * 2 + H_GAP_COUPLE : NODE_W

    let childrenCenterX = offsetX + subtreeWidth / 2

    if (person.children && person.children.length > 0) {
      let childOffsetX = offsetX

      const childrenTotalWidth = person.children.reduce((sum, child, index) => {
        const childWidth = calculateSubtreeWidth(child)
        const gap = index > 0 ? H_GAP : 0

        return sum + childWidth + gap
      }, 0)

      if (childrenTotalWidth < subtreeWidth) {
        childOffsetX = offsetX + (subtreeWidth - childrenTotalWidth) / 2
      }

      const childCenters: number[] = []

      person.children.forEach((child, index) => {
        if (index > 0) {
          childOffsetX += H_GAP
        }

        const childCenter = layoutTree(child, depth + 1, childOffsetX)
        childCenters.push(childCenter)

        edgeList.push({
          fromId: person.id,
          toId: child.id,
          type: 'parent-child',
        })

        childOffsetX += calculateSubtreeWidth(child)
      })

      if (childCenters.length > 0) {
        childrenCenterX = (childCenters[0] + childCenters[childCenters.length - 1]) / 2
      }
    }

    const y = depth * (NODE_H + V_GAP) + PADDING_Y
    let personX: number

    if (hasSpouse) {
      personX = childrenCenterX - coupleWidth / 2
      const spouseX = personX + NODE_W + H_GAP_COUPLE

      nodeMap.set(person.id, {
        id: person.id,
        person,
        depth,
        x: personX,
        y,
        subtreeWidth,
      })

      nodeMap.set(person.spouse!.id, {
        id: person.spouse!.id,
        person: person.spouse!,
        depth,
        x: spouseX,
        y,
        subtreeWidth: NODE_W,
        isSpouse: true,
        bloodRelatedId: person.id,
      })

      edgeList.push({
        fromId: person.id,
        toId: person.spouse!.id,
        type: 'couple',
      })
    } else {
      personX = childrenCenterX - NODE_W / 2

      nodeMap.set(person.id, {
        id: person.id,
        person,
        depth,
        x: personX,
        y,
        subtreeWidth,
      })
    }

    return childrenCenterX
  }

  layoutTree(root, 0, PADDING_X)

  let minX = Infinity
  let minY = Infinity
  let maxX = 0
  let maxY = 0
  nodeMap.forEach((node) => {
    minX = Math.min(minX, node.x)
    minY = Math.min(minY, node.y)
    maxX = Math.max(maxX, node.x + NODE_W)
    maxY = Math.max(maxY, node.y + NODE_H)
  })

  return {
    nodes: Array.from(nodeMap.values()),
    edges: edgeList,
    canvasWidth: maxX + PADDING_X,
    canvasHeight: maxY + PADDING_Y,
    contentMinX: minX,
    contentMinY: minY,
    contentMaxX: maxX,
    contentMaxY: maxY,
  }
}

// --- Vue Flow mapping --------------------------------------------------------

/**
 * Maps the layout onto a Vue Flow graph.
 *
 * The RN renderer drew parent-child connectors as a hand-built SVG path that
 * dropped from the *centre of a couple* into a horizontal bus, then down to each
 * child. Vue Flow edges are strictly pairwise, so to keep that shape we emit a
 * zero-size invisible "junction" node at the couple's midpoint and source every
 * child's edge from it. Vue Flow's built-in `smoothstep` edge then produces the
 * same orthogonal elbow the Skia path did — which is why `useEdgePaths` has no
 * counterpart here.
 */
export function toFlowGraph(layout: TreeLayout): { nodes: FlowNode[], edges: FlowEdge[] } {
  const byId = new Map(layout.nodes.map(node => [node.id, node]))
  const nodes: FlowNode[] = []
  const edges: FlowEdge[] = []

  for (const node of layout.nodes) {
    nodes.push({
      id: node.id,
      type: 'person',
      position: { x: node.x, y: node.y },
      // Fixes hit-testing and edge anchoring without a measurement pass.
      width: NODE_W,
      height: NODE_H,
      draggable: false,
      data: { person: node.person, isSpouse: !!node.isSpouse } satisfies PersonNodeData,
      targetPosition: Position.Top,
      sourcePosition: Position.Right,
    })
  }

  // One junction per parent that actually has children.
  const parentIds = new Set(
    layout.edges.filter(edge => edge.type === 'parent-child').map(edge => edge.fromId),
  )

  for (const parentId of parentIds) {
    const parentNode = byId.get(parentId)
    if (!parentNode) continue

    const spouseNode = layout.nodes.find(n => n.isSpouse && n.bloodRelatedId === parentId)
    const coupleCenter = spouseNode
      ? (parentNode.x + NODE_W + spouseNode.x) / 2
      : parentNode.x + NODE_W / 2

    nodes.push({
      id: junctionId(parentId),
      type: 'junction',
      // Sits on the couple's horizontal connector line, matching where the RN
      // path started its drop.
      position: { x: coupleCenter, y: parentNode.y + NODE_H / 2 },
      width: 1,
      height: 1,
      draggable: false,
      selectable: false,
      focusable: false,
      data: {},
    })
  }

  for (const edge of layout.edges) {
    if (edge.type === 'couple') {
      edges.push({
        id: `couple-${edge.fromId}-${edge.toId}`,
        source: edge.fromId,
        target: edge.toId,
        sourceHandle: 'right',
        targetHandle: 'left',
        type: 'couple',
        selectable: false,
        focusable: false,
      })
      continue
    }

    edges.push({
      id: `child-${edge.fromId}-${edge.toId}`,
      source: junctionId(edge.fromId),
      target: edge.toId,
      sourceHandle: 'bottom',
      targetHandle: 'top',
      type: 'smoothstep',
      selectable: false,
      focusable: false,
      // No arrowhead: the RN renderer drew plain 2px connectors.
      style: { strokeWidth: 2 },
    })
  }

  return { nodes, edges }
}

/**
 * Reactive wrapper used by `FamilyTree.vue`.
 */
export function useTreeLayout(root: MaybeRefOrGetter<Person | undefined>) {
  const layout = computed(() => {
    const value = toValue(root)

    return value ? computeTreeLayout(value) : null
  })

  const graph = computed(() =>
    layout.value ? toFlowGraph(layout.value) : { nodes: [], edges: [] },
  )

  return {
    layout,
    nodes: computed(() => graph.value.nodes),
    edges: computed(() => graph.value.edges),
  }
}
