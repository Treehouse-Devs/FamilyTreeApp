import { PanResponder } from 'react-native'
import { useEffect, useRef, useState } from 'react'
import { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { scheduleOnRN } from 'react-native-worklets'

interface UseActionSheetOptions {
  isOpen: boolean
  onClose: () => void
  onOpen?: () => void
}

export const useActionSheet = ({ isOpen, onClose, onOpen }: UseActionSheetOptions) => {
  const [visible, setVisible] = useState(false)
  const backdropOpacity = useSharedValue(0)
  const translateY = useSharedValue(300)
  const { bottom: bottomInset } = useSafeAreaInsets()

  useEffect(() => {
    if (isOpen) {
      setVisible(true)
      onOpen?.()
      backdropOpacity.value = withTiming(1, { duration: 100 })
      translateY.value = withTiming(0, { duration: 200, easing: Easing.ease })
    } else if (visible) {
      backdropOpacity.value = withTiming(0, { duration: 100 })
      translateY.value = withTiming(300, { duration: 200, easing: Easing.ease }, (finished) => {
        if (finished) {
          scheduleOnRN(setVisible, false)
        }
      })
    }
  }, [isOpen, visible])

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }))

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.value = gestureState.dy
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const shouldClose = gestureState.dy > 100 || gestureState.vy > 0.5

        if (shouldClose) {
          onClose()
        } else {
          translateY.value = withTiming(0, { duration: 100, easing: Easing.ease })
        }
      },
    }),
  ).current

  return { visible, bottomInset, backdropStyle, contentStyle, panResponder }
}
