import { ActionsheetDragIndicator, ActionsheetItem, ActionsheetItemIcon, ActionsheetItemText } from '@/components/ui/actionsheet'
import { Modal, View, Pressable } from 'react-native'
import { ReactNode, ElementType } from 'react'
import Animated from 'react-native-reanimated'
import { useActionSheet } from './useActionSheet'

interface ActionSheetProps {
  isOpen: boolean
  onClose: () => void
  onOpen?: () => void
  children: ReactNode
}

export const ActionSheet = ({ isOpen, onClose, onOpen, children }: ActionSheetProps) => {
  const {
    visible,
    bottomInset,
    backdropStyle,
    contentStyle,
    panResponder,
  } = useActionSheet({ isOpen, onClose, onOpen })

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="none"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        <Animated.View
          style={[backdropStyle, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}
        >
          <Pressable className="flex-1" onPress={onClose} />
        </Animated.View>
        <Animated.View style={[contentStyle, { paddingBottom: bottomInset + 16 }]} className="bg-primary-0 rounded-t-3xl p-5 pt-2">
          <View {...panResponder.panHandlers} className="py-2">
            <ActionsheetDragIndicator className="self-center" />
          </View>
          {children}
        </Animated.View>
      </View>
    </Modal>
  )
}

export const ActionSheetItemWithIcon = ({ icon, text, onPress, destructive }: { icon: ElementType, text: string, onPress: () => void, destructive?: boolean }) => {
  return (
    <ActionsheetItem
      className={`py-3 flex flex-row gap-3 rounded-lg data-[active=true]:scale-95 transition-transform duration-200 ease-in-out ${destructive ? 'data-[active=true]:bg-red-300/30' : 'data-[active=true]:bg-primary-50'}`}
      onPress={onPress}
    >
      <ActionsheetItemIcon as={icon} className={destructive ? 'text-red-700' : 'text-primary-700'} size="xl" />
      <ActionsheetItemText size="lg" className={destructive ? 'text-red-700' : 'text-primary-700'}>{text}</ActionsheetItemText>
    </ActionsheetItem>
  )
}
