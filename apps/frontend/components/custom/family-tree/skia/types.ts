import type { FlatPersonDto } from '@treely/dto'
import type { Person } from '@/store/slices/tree/types'

// --- Layout Types ------------------------------------------------------------

export type NodeLayout = {
  id: string
  person: Person
  depth: number // generation (0 = top-most)
  x: number
  y: number
}

export type Edge = {
  fromId: string
  toId: string
  type: 'parent-child' | 'couple'
  /** For parent-child edges: the parent couple-union the line drops from. */
  fromUnionId?: string
}

/** Geometry of a couple (or single) at one generation — the anchor for child lines. */
export type CoupleUnionLayout = {
  id: string
  memberIds: string[]
  midX: number // horizontal center of the union
  topY: number // members' top (y)
  bottomY: number // members' bottom (y + NODE_H)
}

export type TreeLayout = {
  nodes: NodeLayout[]
  edges: Edge[]
  unions: CoupleUnionLayout[]
  canvasWidth: number
  canvasHeight: number
  contentMinX: number
  contentMinY: number
  contentMaxX: number
  contentMaxY: number
}

// --- Component Props ---------------------------------------------------------

export type FamilyTreeSkiaRef = {
  focusOnNode: (nodeId: string) => void
}

export type FamilyTreeSkiaProps = {
  /** The full flat person graph for the tree (the complete DAG). */
  persons: FlatPersonDto[]
  onPressNode?: (person: Person) => void
  scale?: number
  minScale?: number
  maxScale?: number
  onZoomChange?: (scale: number) => void
}

// --- Constants ---------------------------------------------------------------

export const NODE_W = 140
export const NODE_H = 100
export const THUMB = 36 // image size (diameter)
export const PADDING = 12
export const PADDING_X = PADDING
export const PADDING_Y = PADDING
export const RADIUS = 12

export const H_GAP = 24 // horizontal gap between siblings / unions in the same family
export const H_GAP_SUBTREE = 48 // wider gap between unions of different families
export const H_GAP_COUPLE = 40 // horizontal gap between the two members of a couple
export const V_GAP = 84 // vertical gap between generations
