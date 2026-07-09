import { useMemo } from 'react'
import { Skia } from '@shopify/react-native-skia'
import type { FlatPersonDto } from '@treely/dto'
import type { NodeLayout, Edge, CoupleUnionLayout, TreeLayout } from './types'
import { NODE_W, NODE_H, V_GAP } from './types'
import { computeGenerationLayout } from './computeGenerationLayout'

/**
 * Generation/level-based layout hook. Consumes the full flat person graph and produces the
 * standard TreeLayout (nodes/edges/unions/bounds) that the gestures and cards render.
 */
export function useGenerationLayout(persons: FlatPersonDto[]): TreeLayout {
  return useMemo(() => computeGenerationLayout(persons), [persons])
}

/**
 * Builds SVG path strings for all edges. Parent-child lines drop from the parent couple's
 * midpoint (looked up from the union geometry); couple lines connect the two partners.
 */
export function useEdgePaths(
  nodes: NodeLayout[],
  edges: Edge[],
  unions: CoupleUnionLayout[],
): string[] {
  return useMemo(() => {
    const paths: string[] = []
    const nodeById = new Map(nodes.map(n => [n.id, n]))
    const unionById = new Map(unions.map(u => [u.id, u]))

    // Parent-child edges grouped by the emitting union.
    const childrenByUnion = new Map<string, string[]>()
    for (const edge of edges) {
      if (edge.type !== 'parent-child' || !edge.fromUnionId) continue
      const list = childrenByUnion.get(edge.fromUnionId) ?? []
      list.push(edge.toId)
      childrenByUnion.set(edge.fromUnionId, list)
    }

    for (const [unionId, childIds] of childrenByUnion) {
      const union = unionById.get(unionId)
      if (!union) continue
      const childNodes = childIds
        .map(id => nodeById.get(id))
        .filter((n): n is NodeLayout => !!n)
      if (childNodes.length === 0) continue

      const coupleCenter = union.midX
      const parentMidY = union.topY + NODE_H / 2
      const midY = union.topY + NODE_H + V_GAP / 2

      const path = Skia.Path.Make()
      path.moveTo(coupleCenter, parentMidY)
      path.lineTo(coupleCenter, midY)

      if (childNodes.length === 1) {
        const childCenterX = childNodes[0].x + NODE_W / 2
        path.lineTo(childCenterX, midY)
        path.lineTo(childCenterX, childNodes[0].y)
      } else {
        const leftMost = childNodes.reduce((min, n) => (n.x < min.x ? n : min))
        const rightMost = childNodes.reduce((max, n) => (n.x > max.x ? n : max))
        const leftX = leftMost.x + NODE_W / 2
        const rightX = rightMost.x + NODE_W / 2

        path.moveTo(coupleCenter, midY)
        path.lineTo(leftX, midY)
        path.moveTo(coupleCenter, midY)
        path.lineTo(rightX, midY)

        for (const child of childNodes) {
          const childCenterX = child.x + NODE_W / 2
          path.moveTo(childCenterX, midY)
          path.lineTo(childCenterX, child.y)
        }
      }

      paths.push(path.toSVGString())
    }

    // Couple lines (horizontal connector between partners).
    for (const edge of edges) {
      if (edge.type !== 'couple') continue
      const a = nodeById.get(edge.fromId)
      const b = nodeById.get(edge.toId)
      if (!a || !b) continue
      const left = a.x <= b.x ? a : b
      const right = a.x <= b.x ? b : a
      const y = left.y + NODE_H / 2
      const path = Skia.Path.Make()
      path.moveTo(left.x + NODE_W, y)
      path.lineTo(right.x, y)
      paths.push(path.toSVGString())
    }

    return paths
  }, [nodes, edges, unions])
}
