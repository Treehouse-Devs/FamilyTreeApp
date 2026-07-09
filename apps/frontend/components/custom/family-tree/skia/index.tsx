import React, { forwardRef, useImperativeHandle } from 'react'
import { useTranslation } from 'react-i18next'
import { Canvas, Path, useFont } from '@shopify/react-native-skia'
import { GestureDetector } from 'react-native-gesture-handler'
import Animated from 'react-native-reanimated'

import { asHex, getVar, useCurrentMode } from '@/utils/color-token'
import { useGenerationLayout, useEdgePaths } from './useGenerationLayout'
import { useTreeGestures } from './useTreeGestures'
import { PersonCard } from './person-card'
import type { FamilyTreeSkiaProps, FamilyTreeSkiaRef } from './types'

// re-export types
export { type FamilyTreeSkiaProps, type FamilyTreeSkiaRef } from './types'

export const FamilyTreeSkia = forwardRef<FamilyTreeSkiaRef, FamilyTreeSkiaProps>(({
  persons,
  onPressNode,
  scale = 1,
  minScale = 0.5,
  maxScale = 3,
  onZoomChange,
}, ref) => {
  const mode = useCurrentMode()
  const { t } = useTranslation()

  // Layout — generation/level-based over the full flat graph.
  const layout = useGenerationLayout(persons)
  const { nodes, canvasWidth, canvasHeight } = layout
  const edgePaths = useEdgePaths(nodes, layout.edges, layout.unions)

  // Gestures & transforms
  const { composedGesture, animatedStyle, pressedNodeId, focusOnNode } = useTreeGestures({
    layout,
    nodes,
    scale,
    minScale,
    maxScale,
    onPressNode,
    onZoomChange,
  })

  useImperativeHandle(ref, () => ({
    focusOnNode,
  }))

  // Colors
  const CARD_FILL_COLOR = asHex(getVar(mode, 'secondary', '0'))
  const CARD_PRESSED_FILL_COLOR = asHex(getVar(mode, 'secondary', '50'))
  const CARD_BORDER_COLOR = asHex(getVar(mode, 'secondary', '500'))
  const TEXT_COLOR = asHex(getVar(mode, 'secondary', '900'))
  const EDGE_COLOR = asHex(getVar(mode, 'primary', '800'))

  // Fonts
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-require-imports
  const nameFont = useFont(require('@expo-google-fonts/plus-jakarta-sans/600SemiBold/PlusJakartaSans_600SemiBold.ttf'), 14)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-require-imports
  const smallFont = useFont(require('@expo-google-fonts/plus-jakarta-sans/400Regular/PlusJakartaSans_400Regular.ttf'), 11)

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
              cardFillColor={pressedNodeId === node.id ? CARD_PRESSED_FILL_COLOR : CARD_FILL_COLOR}
              cardBorderColor={CARD_BORDER_COLOR}
              textColor={TEXT_COLOR}
              t={t}
            />
          ))}
        </Canvas>
      </Animated.View>
    </GestureDetector>
  )
})

FamilyTreeSkia.displayName = 'FamilyTreeSkia'
