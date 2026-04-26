import { useMemo } from 'react'
import { Skia } from '@shopify/react-native-skia'
import type { Person } from '@/store/slices/tree/types'
import type {
  NodeLayout,
  Edge } from './types'
import {
  NODE_W,
  NODE_H,
  H_GAP,
  H_GAP_COUPLE,
  V_GAP,
  PADDING_X,
  PADDING_Y,
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

// --- Tree Layout Hook --------------------------------------------------------

export type TreeLayout = {
  nodes: NodeLayout[]
  edges: Edge[]
  canvasWidth: number
  canvasHeight: number
  contentMinX: number
  contentMinY: number
  contentMaxX: number
  contentMaxY: number
}

/**
 * Computes the DFS tree layout: positions every node and collects edges.
 */
export function useTreeLayout(root: Person): TreeLayout {
  return useMemo(() => {
    const nodeMap = new Map<string, NodeLayout>()
    const edgeList: Edge[] = []

    const layoutTree = (
      person: Person,
      depth: number,
      offsetX: number,
    ): number => {
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
  }, [root])
}

// --- Edge Paths Hook ---------------------------------------------------------

/**
 * Builds SVG path strings for all edges (parent-child and couple lines).
 */
export function useEdgePaths(nodes: NodeLayout[], edges: Edge[]): string[] {
  return useMemo(() => {
    const paths: string[] = []

    // Group parent-child edges by parent
    const parentChildEdges = new Map<string, string[]>()
    edges.forEach((edge) => {
      if (edge.type === 'parent-child') {
        const children = parentChildEdges.get(edge.fromId) || []
        children.push(edge.toId)
        parentChildEdges.set(edge.fromId, children)
      }
    })

    // Create paths for parent-child connections
    parentChildEdges.forEach((childIds, parentId) => {
      const parentNode = nodes.find(n => n.id === parentId)
      if (!parentNode) return

      const childNodes = childIds
        .map(id => nodes.find(n => n.id === id))
        .filter(Boolean) as NodeLayout[]

      if (childNodes.length === 0) return

      // Find the couple center (if spouse exists)
      const spouseNode = nodes.find(
        n => n.isSpouse && n.bloodRelatedId === parentId,
      )
      const coupleCenter = spouseNode
        ? (parentNode.x + NODE_W + spouseNode.x) / 2
        : parentNode.x + NODE_W / 2

      // Vertical line down from couple center
      const parentBottomY = parentNode.y + (NODE_H / 2)
      const midY = parentBottomY + (NODE_H / 2) + V_GAP / 2

      const path = Skia.Path.Make()

      // Line from couple center down to mid-height
      path.moveTo(coupleCenter, parentBottomY)
      path.lineTo(coupleCenter, midY)

      if (childNodes.length === 1) {
        // Single child - straight line down
        const child = childNodes[0]
        const childCenterX = child.x + NODE_W / 2
        path.lineTo(childCenterX, midY)
        path.lineTo(childCenterX, child.y)
      } else {
        // Multiple children - horizontal line spanning all
        const leftMostChild = childNodes.reduce((min, n) =>
          n.x < min.x ? n : min,
        )
        const rightMostChild = childNodes.reduce((max, n) =>
          n.x > max.x ? n : max,
        )

        const leftX = leftMostChild.x + NODE_W / 2
        const rightX = rightMostChild.x + NODE_W / 2

        // Horizontal line
        path.moveTo(coupleCenter, midY)
        path.lineTo(leftX, midY)
        path.moveTo(coupleCenter, midY)
        path.lineTo(rightX, midY)

        // Vertical lines down to each child
        childNodes.forEach((child) => {
          const childCenterX = child.x + NODE_W / 2
          path.moveTo(childCenterX, midY)
          path.lineTo(childCenterX, child.y)
        })
      }

      paths.push(path.toSVGString())
    })

    // Add couple connecting lines (horizontal line between partners)
    edges
      .filter(e => e.type === 'couple')
      .forEach((edge) => {
        const person1 = nodes.find(n => n.id === edge.fromId)
        const person2 = nodes.find(n => n.id === edge.toId)

        if (person1 && person2) {
          const path = Skia.Path.Make()
          const y = person1.y + NODE_H / 2
          path.moveTo(person1.x + NODE_W, y)
          path.lineTo(person2.x, y)
          paths.push(path.toSVGString())
        }
      })

    return paths
  }, [nodes, edges])
}
