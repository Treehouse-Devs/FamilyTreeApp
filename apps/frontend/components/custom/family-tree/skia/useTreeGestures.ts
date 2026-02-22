import { useState, useEffect } from 'react'
import { useWindowDimensions } from 'react-native'
import { Gesture } from 'react-native-gesture-handler'
import { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'
import { Person } from '@/store/slices/treeSlice'
import { NODE_W, NODE_H, NodeLayout } from './types'
import type { TreeLayout } from './useTreeLayout'

type UseTreeGesturesParams = {
  layout: TreeLayout
  nodes: NodeLayout[]
  scale: number
  minScale: number
  maxScale: number
  onPressNode?: (person: Person) => void
  onZoomChange?: (scale: number) => void
}

export function useTreeGestures({
  layout,
  nodes,
  scale,
  minScale,
  maxScale,
  onPressNode,
  onZoomChange,
}: UseTreeGesturesParams) {
  const { canvasWidth, canvasHeight, contentMinX, contentMinY, contentMaxX, contentMaxY } = layout

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

  // Track pressed node for visual feedback
  const [pressedNodeId, setPressedNodeId] = useState<string | null>(null)

  // Get viewport dimensions for view-center zoom
  const { width: viewportWidth, height: viewportHeight } = useWindowDimensions()

  // Helper to notify zoom changes (must use scheduleOnRN for worklet -> JS thread)
  const notifyZoomChange = (newScale: number) => {
    if (onZoomChange) {
      onZoomChange(newScale)
    }
  }

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
  }, [contentMinX, contentMinY, contentMaxX, contentMaxY, viewportWidth, viewportHeight, onZoomChange])

  // Handle tap gesture
  const tapGesture = Gesture.Tap()
    .onBegin((event) => {
      'worklet'
      const { x, y } = event
      const adjustedX = x
      const adjustedY = y

      // Find which node is being pressed
      for (const node of nodes) {
        if (
          adjustedX >= node.x
          && adjustedX <= node.x + NODE_W
          && adjustedY >= node.y
          && adjustedY <= node.y + NODE_H
        ) {
          scheduleOnRN(setPressedNodeId, node.id)
          break
        }
      }
    })
    .onFinalize(() => {
      'worklet'
      scheduleOnRN(setPressedNodeId, null)
    })
    .onEnd((event) => {
      'worklet'
      if (!onPressNode) return

      const { x, y } = event

      // Adjust tap coordinates based on current scale
      const adjustedX = x
      const adjustedY = y

      // Find which node was tapped
      for (const node of nodes) {
        if (
          adjustedX >= node.x
          && adjustedX <= node.x + NODE_W
          && adjustedY >= node.y
          && adjustedY <= node.y + NODE_H
        ) {
          scheduleOnRN(onPressNode, node.person)
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
      const contentCenterX = (screenCenterX - savedTranslateX.value) / savedScale.value
      const contentCenterY = (screenCenterY - savedTranslateY.value) / savedScale.value

      // After zoom, we want this content point to still be at the screen center
      const newTranslateX = screenCenterX - contentCenterX * clampedScale
      const newTranslateY = screenCenterY - contentCenterY * clampedScale

      translateX.value = newTranslateX
      translateY.value = newTranslateY
      scaleValue.value = clampedScale
    })
    .onEnd(() => {
      'worklet'
      // Only notify parent when gesture ends to avoid re-renders during animation
      scheduleOnRN(notifyZoomChange, scaleValue.value)
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

  // Animated style for pan and zoom transforms
  const animatedStyle = useAnimatedStyle(() => ({
    width: canvasWidth,
    height: canvasHeight,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scaleValue.value },
    ],
  }))

  return { composedGesture, animatedStyle, pressedNodeId }
}
