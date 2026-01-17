// FamilyTreeSkia.tsx
import React, { useMemo, useEffect } from 'react'
import { useWindowDimensions } from 'react-native'
import { useTranslation } from 'react-i18next'
import {
  Canvas,
  RoundedRect,
  Text,
  useFont,
  Group,
  Path,
  Skia,
  Circle,
  Image,
  useImage,
} from '@shopify/react-native-skia'
import { GestureDetector, Gesture } from 'react-native-gesture-handler'
import Animated, { useSharedValue, useAnimatedStyle, runOnJS, withTiming } from 'react-native-reanimated'

import { Person } from '@/store/slices/treeSlice'
import { asHex, getVar, useCurrentMode } from '@/utils/color-token'

// --- Types -------------------------------------------------------------------

type NodeLayout = {
  id: string
  person: Person
  depth: number
  x: number
  y: number
  subtreeWidth: number
  isSpouse?: boolean
  bloodRelatedId?: string // For spouses, the ID of the blood-related person
}

type Edge = {
  fromId: string
  toId: string
  type: 'parent-child' | 'couple'
}

type Props = {
  root: Person
  onPressNode?: (person: Person) => void
  scale?: number
  minScale?: number
  maxScale?: number
  onZoomChange?: (scale: number) => void
}

// --- Constants ---------------------------------------------------------------

const NODE_W = 140
const NODE_H = 100
const THUMB = 36 // image size (diameter)
const PADDING = 12
const PADDING_X = PADDING
const PADDING_Y = PADDING
const RADIUS = 12

const H_GAP = 24 // horizontal gap between siblings
const H_GAP_COUPLE = 40 // horizontal gap between couple
const V_GAP = 84 // vertical gap between generations

// --- Helper Functions --------------------------------------------------------

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

/**
 * Format birth year from timestamp
 */
const getYear = (timestamp: number): string => {
  return new Date(timestamp).getFullYear().toString()
}

/**
 * Calculate age or death info
 */
type TFunction = (key: string, options?: Record<string, unknown>) => string

const getAgeInfo = (birthDate: number, deathDate: number | undefined, t: TFunction): string => {
  const birthYear = new Date(birthDate).getFullYear()

  if (deathDate) {
    const deathYear = new Date(deathDate).getFullYear()
    return t('deceased', { year: deathYear })
  }

  const currentYear = new Date().getFullYear()
  const age = currentYear - birthYear
  return t('age', { years: age })
}

// --- Main Component ----------------------------------------------------------

export const FamilyTreeSkia: React.FC<Props> = ({
  root,
  onPressNode,
  scale = 1,
  minScale = 0.5,
  maxScale = 3,
  onZoomChange,
}) => {
  const mode = useCurrentMode()
  const { t } = useTranslation()

  // Store the scale at pinch start for calculating delta
  const savedScale = useSharedValue(scale)

  // Internal scale shared value for smooth animations
  const scaleValue = useSharedValue(scale)

  // Sync scale prop with internal shared value (for button-based zoom)
  useEffect(() => {
    scaleValue.value = withTiming(scale)
  }, [scale])

  // Internal translation state (managed by the component)
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const savedTranslateX = useSharedValue(0)
  const savedTranslateY = useSharedValue(0)

  // Get viewport dimensions for view-center zoom
  const { width: viewportWidth, height: viewportHeight } = useWindowDimensions()

  // Helper to notify zoom changes (must use runOnJS for worklet -> JS thread)
  const notifyZoomChange = (newScale: number) => {
    if (onZoomChange) {
      onZoomChange(newScale)
    }
  }

  // Colors based on current mode
  const CARD_FILL_COLOR = asHex(getVar(mode, 'secondary', '0'))
  const CARD_BORDER_COLOR = asHex(getVar(mode, 'secondary', '500'))
  const TEXT_COLOR = asHex(getVar(mode, 'secondary', '900'))
  const EDGE_COLOR = asHex(getVar(mode, 'primary', '800'))

  // Load font
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-require-imports
  const nameFont = useFont(require('@expo-google-fonts/plus-jakarta-sans/500Medium/PlusJakartaSans_500Medium.ttf'), 14)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-require-imports
  const smallFont = useFont(require('@expo-google-fonts/plus-jakarta-sans/400Regular/PlusJakartaSans_400Regular.ttf'), 11)

  // Layout calculation using DFS - moved below to include content bounds

  // Destructure layout results including content bounds
  const { nodes, edges, canvasWidth, canvasHeight, contentMinX, contentMinY, contentMaxX, contentMaxY } = useMemo(() => {
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

  // Auto-center on initial load (at default 1.0 scale)
  useEffect(() => {
    const initialScale = 1.0

    // Calculate actual content dimensions
    const contentWidth = (contentMaxX - contentMinX) * initialScale
    const contentHeight = (contentMaxY - contentMinY) * initialScale

    // Calculate offset to center the content
    let initialTranslateX: number
    let initialTranslateY: number

    if (contentWidth <= viewportWidth) {
      // Content fits horizontally - center it
      // Account for the content's starting position (contentMinX)
      initialTranslateX = (viewportWidth - contentWidth) / 2 - contentMinX * initialScale
    } else {
      // Content is wider than viewport - align content start to left edge
      initialTranslateX = -(contentWidth - viewportWidth) / 2 * initialScale
    }

    if (contentHeight <= viewportHeight) {
      // Content fits vertically - center it
      initialTranslateY = (viewportHeight - contentHeight) / 2 - contentMinY * initialScale
    } else {
      // Content is taller than viewport - align content start to top edge
      initialTranslateY = -contentMinY * initialScale
    }

    // Set initial values
    scaleValue.value = initialScale
    savedScale.value = initialScale
    translateX.value = initialTranslateX
    translateY.value = initialTranslateY
    savedTranslateX.value = initialTranslateX
    savedTranslateY.value = initialTranslateY

    // Notify parent of initial zoom
    if (onZoomChange) {
      onZoomChange(initialScale)
    }

    console.log(viewportWidth, contentWidth, initialTranslateX)
  }, [contentMinX, contentMinY, contentMaxX, contentMaxY, viewportWidth, viewportHeight, onZoomChange])

  // Handle tap gesture
  const tapGesture = Gesture.Tap().onEnd((event) => {
    if (!onPressNode) return

    const { x, y } = event

    // Adjust tap coordinates based on current scale
    const adjustedX = x / scale
    const adjustedY = y / scale

    // Find which node was tapped
    for (const node of nodes) {
      if (
        adjustedX >= node.x
        && adjustedX <= node.x + NODE_W
        && adjustedY >= node.y
        && adjustedY <= node.y + NODE_H
      ) {
        onPressNode(node.person)
        break
      }
    }
  })

  // Handle pinch gesture for zoom (requires 2 fingers)
  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      'worklet'
      savedScale.value = scaleValue.value
      savedTranslateX.value = translateX.value
      savedTranslateY.value = translateY.value
    })
    .onUpdate((event) => {
      'worklet'
      const newScale = savedScale.value * event.scale
      const clampedScale = Math.min(Math.max(newScale, minScale), maxScale)

      // The center of the screen in screen coordinates
      const screenCenterX = viewportWidth / 2
      const screenCenterY = viewportHeight / 2

      // Find the content point that's currently at the screen center
      // Screen coords = content coords * scale + translate
      // So: content coords = (screen coords - translate) / scale
      const contentCenterX = (screenCenterX - savedTranslateX.value) / savedScale.value
      const contentCenterY = (screenCenterY - savedTranslateY.value) / savedScale.value

      // After zoom, we want this content point to still be at the screen center
      // screenCenterX = contentCenterX * newScale + newTranslateX
      // newTranslateX = screenCenterX - contentCenterX * newScale
      const newTranslateX = screenCenterX - contentCenterX * clampedScale
      const newTranslateY = screenCenterY - contentCenterY * clampedScale

      translateX.value = newTranslateX
      translateY.value = newTranslateY
      scaleValue.value = clampedScale
    })
    .onEnd(() => {
      'worklet'
      // Only notify parent when gesture ends to avoid re-renders during animation
      runOnJS(notifyZoomChange)(scaleValue.value)
    })

  // Handle pan gesture for bi-directional scrolling
  const panGesture = Gesture.Pan()
    .onStart(() => {
      'worklet'
      savedTranslateX.value = translateX.value
      savedTranslateY.value = translateY.value
    })
    .onUpdate((event) => {
      'worklet'
      translateX.value = savedTranslateX.value + event.translationX
      translateY.value = savedTranslateY.value + event.translationY
    })

  // Combine gestures - tap wins first, then pan or pinch
  const composedGesture = Gesture.Race(
    tapGesture,
    Gesture.Simultaneous(panGesture, pinchGesture),
  )

  // Animated style for pan and zoom transforms (must be before conditional return)
  const animatedStyle = useAnimatedStyle(() => ({
    width: canvasWidth,
    height: canvasHeight,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scaleValue.value },
    ],
  }))

  // Build edge paths
  const edgePaths = useMemo(() => {
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

  if (!nameFont || !smallFont) {
    return null
  }

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={[animatedStyle, { backgroundColor: 'transparent' }]}>
        <Canvas style={{ flex: 1, width: canvasWidth, height: canvasHeight, backgroundColor: 'transparent' }}>
          {/* Draw edges first (behind nodes) */}
          {edgePaths.map((pathString, index) => (
            <Path
              key={`edge-${index}`}
              path={pathString}
              color={EDGE_COLOR}
              style="stroke"
              strokeWidth={2}
            />
          ))}

          {/* Draw nodes */}
          {nodes.map(node => (
            <PersonCard
              key={node.id}
              node={node}
              nameFont={nameFont}
              smallFont={smallFont}
              cardFillColor={CARD_FILL_COLOR}
              cardBorderColor={CARD_BORDER_COLOR}
              textColor={TEXT_COLOR}
              t={t}
            />
          ))}
        </Canvas>
      </Animated.View>
    </GestureDetector>
  )
}

// --- PersonCard Component ----------------------------------------------------

type PersonCardProps = {
  node: NodeLayout
  nameFont: ReturnType<typeof useFont>
  smallFont: ReturnType<typeof useFont>
  cardFillColor: string
  cardBorderColor: string
  textColor: string
  t: TFunction
}

const PersonCard: React.FC<PersonCardProps> = ({
  node,
  nameFont,
  smallFont,
  cardFillColor,
  cardBorderColor,
  textColor,
  t,
}) => {
  const { person, x, y } = node
  const image = useImage(person.imageThumbnailUrl || null)

  const yearText = getYear(person.birthDate)
  const ageText = getAgeInfo(person.birthDate, person.deathDate, t)

  // Calculate text positions (centered)
  const nameWidth = nameFont?.measureText(person.name).width || 0
  const nameY = y + THUMB + PADDING + 20

  const nameX = x + (NODE_W - nameWidth) / 2
  const infoY = nameY + 18

  // Combined year + age text
  const infoText = `${yearText} | ${ageText}`
  const infoWidth = smallFont?.measureText(infoText).width || 0
  const infoX = x + (NODE_W - infoWidth) / 2

  return (
    <Group>
      {/* Card background */}
      <RoundedRect
        x={x}
        y={y}
        width={NODE_W}
        height={NODE_H}
        r={RADIUS}
        color={cardFillColor}
      />
      {/* Card border */}
      <RoundedRect
        x={x}
        y={y}
        width={NODE_W}
        height={NODE_H}
        r={RADIUS}
        color={cardBorderColor}
        style="stroke"
        strokeWidth={2}
      />

      {/* Avatar circle background */}
      <Circle
        cx={x + NODE_W / 2}
        cy={y + THUMB / 2 + PADDING}
        r={THUMB / 2}
        color={cardBorderColor}
      />

      {/* Avatar image (if available) */}
      {image && (
        <Image
          image={image}
          x={x + NODE_W / 2 - THUMB / 2}
          y={y + PADDING}
          width={THUMB}
          height={THUMB}
          fit="cover"
        />
      )}

      {/* Name text */}
      <Text
        x={nameX}
        y={nameY}
        text={person.name}
        font={nameFont}
        color={textColor}
      />

      {/* Year and age info */}
      <Text
        x={infoX}
        y={infoY}
        text={infoText}
        font={smallFont}
        color={textColor}
      />
    </Group>
  )
}
