import type { ReactNode } from 'react'
import React from 'react'
import { Modal as RNModal, Pressable, View } from 'react-native'
import Animated, { Easing, FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated'
import { Text } from '@/components/ui/text'
import { VStack } from '@/components/ui/vstack'
import { Button, ButtonText } from '@/components/ui/button'

export const sharedViewClassName = 'bg-secondary-0 rounded-2xl border-2 border-secondary-500 px-[0.75rem] py-[0.625rem] items-center shadow-lg elevation-lg'

export interface ModalProps {
  visible: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  /** Optional custom title component, overrides title prop */
  TitleComponent?: ReactNode
  /** Additional className for the content container */
  contentClassName?: string
  button?: {
    text: string
    onPress: () => void
    isDisabled: boolean
    isLoading?: boolean
    action?: 'primary' | 'secondary' | 'negative' | 'positive'
  }
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  TitleComponent,
  contentClassName = '',
  button,
}) => {
  return (
    <RNModal
      visible={visible}
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable
        className="flex-1 bg-black/50 justify-center items-center"
        onPress={onClose}
      >
        <Animated.View
          layout={LinearTransition.duration(150).easing(Easing.ease)}
          className={`min-w-fit max-w-[80%] lg:max-w-[60%] xl:max-w-[50%] w-full ${contentClassName}`}
        >
          <Pressable onPress={e => e.stopPropagation()}>
            <Animated.View
              entering={FadeIn.duration(150)}
              exiting={FadeOut.duration(100)}
              className={`${sharedViewClassName} min-w-fit w-full`}
            >
              {/* Title Section */}
              {(title || TitleComponent) && (
                <View className="mb-6">
                  {TitleComponent || (
                    <Text className="text-xl font-heading text-secondary-800">{title}</Text>
                  )}
                </View>
              )}
              {/* Content */}
              <VStack className="w-full items-center" space="lg">
                {children}
                {button && (
                  <Button
                    key={`btn-${button.isDisabled}`}
                    onPress={button.onPress}
                    className="w-[6rem] mx-4"
                    isDisabled={button.isDisabled}
                    isLoading={button.isLoading}
                    action={button.action ?? 'primary'}
                  >
                    <ButtonText>{button.text}</ButtonText>
                  </Button>
                )}
              </VStack>
            </Animated.View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </RNModal>
  )
}

export default Modal
