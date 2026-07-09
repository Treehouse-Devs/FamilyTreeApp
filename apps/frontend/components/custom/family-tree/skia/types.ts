import type { Person } from '@/store/slices/tree/types'

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

// --- Component Props ---------------------------------------------------------

export type FamilyTreeSkiaRef = {
  focusOnNode: (nodeId: string) => void
}

export type FamilyTreeSkiaProps = {
  /** A single root (back-compat). Prefer `roots` for multi-root forests. */
  root?: Person
  /** All top-level roots; rendered side by side under a virtual super-root. */
  roots?: Person[]
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

export const H_GAP = 24 // horizontal gap between siblings
export const H_GAP_COUPLE = 40 // horizontal gap between couple
export const V_GAP = 84 // vertical gap between generations

// Id of the synthetic, non-rendered parent used to lay out multiple real roots as a forest.
export const VIRTUAL_ROOT_ID = '__virtual_root__'
