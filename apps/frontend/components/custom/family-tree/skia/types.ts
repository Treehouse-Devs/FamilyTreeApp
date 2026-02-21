import { Person } from '@/store/slices/treeSlice'

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

export type FamilyTreeSkiaProps = {
  root: Person
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
