import type { Person } from '@/types/tree'

// --- Layout Types ------------------------------------------------------------

export type NodeLayout = {
  id: string
  person: Person
  depth: number
  x: number
  y: number
  subtreeWidth: number
  isSpouse?: boolean
  bloodRelatedId?: string // For spouses, the ID of the blood-related person
}

export type Edge = {
  fromId: string
  toId: string
  type: 'parent-child' | 'couple'
}

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

// --- Constants ---------------------------------------------------------------
// Copied verbatim from the RN app's `family-tree/skia/types.ts` so the ported
// layout produces pixel-identical geometry.

export const NODE_W = 140
export const NODE_H = 100
export const THUMB = 36 // image size (diameter)
export const PADDING = 12
export const PADDING_X = PADDING
export const PADDING_Y = PADDING
export const RADIUS = 12

export const H_GAP = 24 // horizontal gap between siblings
export const H_GAP_COUPLE = 40 // horizontal gap between couple
export const V_GAP = 84 // vertical gap between generations

// --- Vue Flow node payloads --------------------------------------------------

export type PersonNodeData = {
  person: Person
  isSpouse: boolean
}

/** Prefix for the invisible nodes that anchor parent-child connectors. */
export const JUNCTION_PREFIX = 'junction:'

export const junctionId = (parentId: string) => `${JUNCTION_PREFIX}${parentId}`
