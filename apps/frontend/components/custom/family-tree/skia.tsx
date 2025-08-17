// FamilyTreeSkia.tsx
import React, { useMemo, useRef } from 'react'
import { Dimensions, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import {
  Canvas,
  Group,
  RoundedRect,
  Path,
  Text as SkiaText,
  useFont,
  useImage,
  Image as SkiaImage,
  Paint,
} from '@shopify/react-native-skia'

// 👉 import fonts from expo-google-fonts
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans'
import { Person } from '@/store/slices/treeSlice'
import { asHex, getVar, useCurrentMode } from '@/utils/color-token'

type NodeLayout = {
  id: string
  person: Person
  depth: number
  x: number
  y: number
  subtreeWidth: number
}
type Edge = { fromId: string, toId: string }

// --- Constants ---------------------------------------------------------------

const NODE_W = 140
const NODE_H = 100
const THUMB = 36 // image size (square)
const PADDING = 12
const PADDING_X = PADDING
const PADDING_Y = PADDING
const RADIUS = 12

const mode = useCurrentMode()
const CARD_FILL_COLOR = asHex(getVar(mode, 'secondary', '0'))
const CARD_BORDER_COLOR = asHex(getVar(mode, 'secondary', '500'))
const TEXT_COLOR = asHex(getVar(mode, 'secondary', '900'))
const EDGE_COLOR = asHex(getVar(mode, 'primary', '800'))

const H_GAP = 24 // horizontal gap between siblings
const V_GAP = 100 // vertical gap between generations

// --- Helpers: time/age formatting -------------------------------------------

const now = () => Date.now()

function birthYear(birthDate: number | undefined) {
  if (!birthDate) return '—'
  try {
    return new Date(birthDate).getFullYear().toString()
  } catch {
    return '—'
  }
}

function calcAge(birthDate?: number, deathDate?: number) {
  if (!birthDate) return '—'
  const end = deathDate ?? now()
  const yBirth = new Date(birthDate).getFullYear()
  const yEnd = new Date(end).getFullYear()

  // rough age by year; if you want month/day accuracy, compare month/day too
  const age = Math.max(0, yEnd - yBirth)
  return deathDate ? `†${age}` : `${age}`
}

// --- Layout (post-order) -----------------------------------------------------
//
// Computes subtree widths bottom-up, then assigns x so that each parent is
// centered above the horizontal block occupied by its children.
//
// Returns flat nodes + edges + dimensions.

function layoutTree(root: Person) {
  const nodes: NodeLayout[] = []
  const edges: Edge[] = []

  // post-order to compute subtree widths
  function measure(node: Person): number {
    const kids = node.children ?? []
    if (kids.length === 0) {
      return NODE_W
    }
    let widthSum = 0
    for (const c of kids) {
      const w = measure(c)
      widthSum += w
    }
    // add gaps between siblings (n-1 gaps)
    if (kids.length > 1) widthSum += (kids.length - 1) * H_GAP
    return Math.max(NODE_W, widthSum)
  }

  function place(node: Person, depth: number, leftX: number): number {
    // Returns the horizontal center of this node (to allow centering by parent)
    const kids = node.children ?? []
    let subtreeWidth = NODE_W

    if (kids.length === 0) {
      // leaf
      nodes.push({
        id: node.id,
        person: node,
        depth,
        x: leftX,
        y: depth * (NODE_H + V_GAP),
        subtreeWidth,
      })
      return leftX + NODE_W / 2
    }

    // compute each child's subtreeWidth
    const childWidths = kids.map(measure)
    const totalChildrenWidth
      = Math.max(
        NODE_W,
        childWidths.reduce((a, b) => a + b, 0) + (kids.length - 1) * H_GAP,
      )

    subtreeWidth = Math.max(NODE_W, totalChildrenWidth)

    // place children left-to-right inside [leftX, leftX + totalChildrenWidth]
    let cursorX = leftX
    const childCenters: number[] = []
    for (let i = 0; i < kids.length; i++) {
      const cw = childWidths[i]
      const center = place(kids[i], depth + 1, cursorX)
      childCenters.push(center)
      cursorX += cw + H_GAP
    }

    // the parent x should be centered above the children block
    const parentLeftX = leftX + (totalChildrenWidth - NODE_W) / 2
    const parentCenterX = parentLeftX + NODE_W / 2

    nodes.push({
      id: node.id,
      person: node,
      depth,
      x: parentLeftX,
      y: depth * (NODE_H + V_GAP),
      subtreeWidth,
    })

    // edges
    for (const kid of kids) {
      edges.push({ fromId: node.id, toId: kid.id })
    }

    return parentCenterX
  }

  const rootWidth = measure(root)
  // horizontally center the root on the canvas initial viewport; we'll just start at 0
  place(root, 0, 0)

  // find overall bounds
  const width
    = Math.max(...nodes.map(n => n.x + n.subtreeWidth))
      - Math.min(...nodes.map(n => n.x))
  const height
    = Math.max(...nodes.map(n => n.y + NODE_H))
      - Math.min(...nodes.map(n => n.y))

  return { nodes, edges, width: Math.max(NODE_W, width), height: Math.max(NODE_H, height) }
}

// --- Component ---------------------------------------------------------------

type Props = {
  root: Person
  onPressNode?: (id: string) => void
}

export const FamilyTreeSkia: React.FC<Props> = ({ root, onPressNode }) => {
  const { width: vw, height: vh } = Dimensions.get('window')

  const { nodes, edges, width: contentW, height: contentH } = useMemo(
    () => layoutTree(root),
    [root],
  )

  const rectIndex = useMemo(
    () => nodes.map(n => ({ id: n.id, x: n.x, y: n.y, w: 180, h: 84 })),
    [nodes],
  )

  // 👉 load fonts with different weights
  const fontRegular = useFont(PlusJakartaSans_400Regular, 12)
  const fontSemiBold = useFont(PlusJakartaSans_600SemiBold, 14)
  const fontBold = useFont(PlusJakartaSans_700Bold, 16)

  // Pan/Zoom state
  const sx = useRef(1)
  const tx = useRef(0)
  const ty = useRef(40)

  const pan = Gesture.Pan().onChange((e) => {
    tx.current += e.changeX
    ty.current += e.changeY
  })

  const pinch = Gesture.Pinch().onChange((e) => {
    const next = sx.current * e.scaleChange
    sx.current = Math.max(0.35, Math.min(3, next))
  })

  const gestures = Gesture.Simultaneous(pan, pinch)

  // Edge paths
  const edgePaths = useMemo(() => {
    const idToNode = new Map(nodes.map(n => [n.id, n]))
    return edges.map((e) => {
      const a = idToNode.get(e.fromId)!
      const b = idToNode.get(e.toId)!
      const ax = a.x + 90
      const ay = a.y + 84
      const bx = b.x + 90
      const by = b.y
      const midY = (ay + by) / 2
      return `M ${ax} ${ay} C ${ax} ${midY}, ${bx} ${midY}, ${bx} ${by}`
    })
  }, [nodes, edges])

  // Images
  const images = nodes.map(n => ({
    id: n.id,
    image: useImage(n.person.imageThumbnailUrl ?? ''),
  }))

  return (
    <GestureDetector gesture={gestures}>
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <Canvas style={{ width: vw, height: vh }}>
          <Group transform={[{ translateX: tx.current }, { translateY: ty.current }, { scale: sx.current }]}>
            {/* Edges */}
            {edgePaths.map((d, i) => (
              <Path key={`e-${i}`} path={d} style="stroke" color="#C7CBD3" strokeWidth={2} />
            ))}

            {/* Nodes */}
            {nodes.map((n) => {
              const birthYear = new Date(n.person.birthDate).getFullYear().toString()
              const age
                = n.person.deathDate
                  ? `†${new Date(n.person.deathDate).getFullYear() - new Date(n.person.birthDate).getFullYear()}`
                  : `${new Date().getFullYear() - new Date(n.person.birthDate).getFullYear()}`

              const imgRec = images.find(im => im.id === n.id)
              const img = imgRec?.image ?? null

              const thumbX = n.x + 12
              const thumbY = n.y + (84 - 48) / 2
              const textX = thumbX + 58
              const nameY = n.y + 28
              const birthY = nameY + 20
              const ageY = birthY + 18

              return (
                <Group key={n.id}>
                  <RoundedRect
                    x={n.x}
                    y={n.y}
                    width={180}
                    height={84}
                    r={14}
                    color={CARD_FILL_COLOR}
                  >
                    <Paint
                      style="stroke"
                      color={CARD_BORDER_COLOR}
                      strokeWidth={2}
                    />
                  </RoundedRect>
                  {img && (
                    <SkiaImage
                      image={img}
                      x={thumbX}
                      y={thumbY}
                      width={48}
                      height={48}
                      fit="cover"
                    />
                  )}

                  {/* Name → Bold */}
                  {fontBold && (
                    <SkiaText
                      x={textX}
                      y={nameY}
                      text={n.person.name}
                      font={fontBold}
                      color="#1F2A37"
                    />
                  )}
                  {/* Birth year → SemiBold */}
                  {fontSemiBold && (
                    <SkiaText
                      x={textX}
                      y={birthY}
                      text={`Born: ${birthYear}`}
                      font={fontSemiBold}
                      color="#4B5563"
                    />
                  )}
                  {/* Age → Regular */}
                  {fontRegular && (
                    <SkiaText
                      x={textX}
                      y={ageY}
                      text={`Age: ${age}`}
                      font={fontRegular}
                      color={n.person.deathDate ? '#9CA3AF' : '#334155'}
                    />
                  )}
                </Group>
              )
            })}
          </Group>
        </Canvas>
      </View>
    </GestureDetector>
  )
}
