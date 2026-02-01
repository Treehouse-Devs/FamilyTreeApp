import { ActionsheetItem, ActionsheetItemText, ActionsheetDragIndicator, ActionsheetItemIcon } from '@/components/ui/actionsheet'
import { Modal, View, Pressable, Image, Text, PanResponder } from 'react-native'
import { ElementType, useEffect, useRef, useState } from 'react'
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, runOnJS } from 'react-native-reanimated'
import { useFamilyTree } from '@/hooks/useFamilyTree'
import { Printer, Share2, Trash, Pencil, Users, Check } from 'lucide-react-native'
import { Button, ButtonIcon } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { Input, InputField } from '@/components/ui/input'
import { TreeService } from '@/services/treeService'

export const FamilyMenuActionSheet = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [visible, setVisible] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState('')
  const backdropOpacity = useSharedValue(0)
  const translateY = useSharedValue(300)
  const { selectedTree, setTree } = useFamilyTree()
  const { t } = useTranslation()

  useEffect(() => {
    if (isOpen) {
      setVisible(true)
      setIsEditingName(false) // Reset edit mode when opening
      setEditedName(selectedTree?.name || '')
      // Animate in
      backdropOpacity.value = withTiming(1, { duration: 100 })
      translateY.value = withTiming(0, { duration: 200, easing: Easing.ease })
    } else if (visible) {
      // Animate out
      backdropOpacity.value = withTiming(0, { duration: 100 })
      translateY.value = withTiming(300, { duration: 200, easing: Easing.ease }, (finished) => {
        if (finished) {
          runOnJS(setVisible)(false)
        }
      })
    }
  }, [isOpen, visible])

  const handleClose = () => {
    onClose()
  }

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }))

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  const handleToggleEdit = () => {
    if (isEditingName) {
      // Save the edited name
      if (selectedTree && editedName.trim()) {
        void TreeService.updateTree({ ...selectedTree, name: editedName.trim() })
      }
      setIsEditingName(false)
    } else {
      // Enter edit mode
      setEditedName(selectedTree?.name || '')
      setIsEditingName(true)
    }
  }

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        // Only allow dragging down
        if (gestureState.dy > 0) {
          translateY.value = gestureState.dy
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const shouldClose = gestureState.dy > 100 || gestureState.vy > 0.5

        if (shouldClose) {
          // Close the sheet
          onClose()
        } else {
          // Snap back to original position
          translateY.value = withTiming(0, { duration: 100, easing: Easing.ease })
        }
      },
    }),
  ).current

  const actionItems = [
    {
      icon: Users,
      text: t('familyMemberList'),
      onPress: () => {

      },
    },
    {
      icon: Share2,
      text: t('share'),
      onPress: () => {

      },
    },
    {
      icon: Printer,
      text: t('print'),
      onPress: () => {

      },
    },
    {
      icon: Trash,
      text: t('remove'),
      onPress: () => {

      },
      destructive: true,
    },
  ]

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View className="flex-1 justify-end">
        <Animated.View
          style={[backdropStyle, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}
        >
          <Pressable className="flex-1" onPress={handleClose} />
        </Animated.View>
        <Animated.View style={contentStyle} className="bg-primary-0 rounded-t-3xl p-5 pt-2">
          <View {...panResponder.panHandlers} className="py-2">
            <ActionsheetDragIndicator className="self-center" />
          </View>

          {/* Header with family image and name */}
          <View className="flex-row items-center py-4 px-2">
            <View className="w-16 h-16 rounded-full bg-primary-800 overflow-hidden mr-3">
              {selectedTree?.familyImageUrl
                ? (
                    <Image
                      source={{ uri: selectedTree?.familyImageUrl }}
                      className="w-full h-full"
                    />
                  )
                : (
                    <View className="w-full h-full bg-teal-100 items-center justify-center">
                      <Text className="text-2xl text-teal-600">👨‍👩‍👧‍👦</Text>
                    </View>
                  )}
            </View>
            {isEditingName
              ? (
                  <Input className="flex-1 mr-2">
                    <InputField
                      value={editedName}
                      onChangeText={setEditedName}
                      placeholder="Family name"
                      className="text-xl font-semibold text-primary-800"
                      autoFocus
                    />
                  </Input>
                )
              : (
                  <Text className="flex-1 text-xl font-semibold text-primary-800">
                    {selectedTree?.name || 'Family Tree'}
                  </Text>
                )}
            <Button
              className="p-2 mr-2 w-10 h-10 bg-transparent data-[active=true]:bg-primary-50 rounded-full items-center justify-center"
              onPress={handleToggleEdit}
            >
              <ButtonIcon as={isEditingName ? Check : Pencil} className="text-primary-700 w-full h-full" />
            </Button>
          </View>

          {/* Divider */}
          <View className="h-px bg-primary-800/50 mb-2 mx-2" />

          {actionItems.map((item, index) => (
            <ActionSheetItemWithIcon
              key={index}
              icon={item.icon}
              text={item.text}
              onPress={item.onPress}
              destructive={item.destructive}
            />
          ))}
        </Animated.View>
      </View>
    </Modal>
  )
}

const ActionSheetItemWithIcon = ({ icon, text, onPress, destructive }: { icon: ElementType, text: string, onPress: () => void, destructive?: boolean }) => {
  return (
    <ActionsheetItem
      className={`py-3 flex flex-row gap-3 rounded-lg ${destructive ? 'data-[active=true]:bg-red-300/30' : 'data-[active=true]:bg-primary-50'}`}
      onPress={onPress}
    >
      <ActionsheetItemIcon as={icon} className={destructive ? 'text-red-700' : 'text-primary-700'} size="xl" />
      <ActionsheetItemText size="lg" className={destructive ? 'text-red-700' : 'text-primary-700'}>{text}</ActionsheetItemText>
    </ActionsheetItem>
  )
}
