import { View, Pressable, Image, Text } from 'react-native'
import { useState } from 'react'
import { useFamilyTree } from '@/hooks/useFamilyTree'
import { Printer, Share2, Trash2, Pencil, Users, Check } from 'lucide-react-native'
import { Button, ButtonIcon } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { Input, InputField } from '@/components/ui/input'
import { TreeService } from '@/services/treeService'
import { navigate } from 'expo-router/build/global-state/routing'
import DUMMY_FAMILY from '@/assets/images/dummy-family.webp'
import { ImageEditModal } from '@/components/custom/modals/image-edit-modal'
import * as ImagePicker from 'expo-image-picker'
import { ActionSheet, ActionSheetItemWithIcon } from '@/components/custom/action-sheet'
import { useCompressImage } from '@/hooks/useCompressImage'
import Modal from '@/components/custom/modals/modal'
import { VStack } from '@/components/ui/vstack'

export const FamilyMenuActionSheet = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState('')
  const [imageEditModalVisible, setImageEditModalVisible] = useState(false)
  const [selectedImageUri, setSelectedImageUri] = useState<string | undefined>()
  const [isUploading, setIsUploading] = useState(false)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [isDeleteLoading, setIsDeleteLoading] = useState(false)
  const { selectedTree, removeTree } = useFamilyTree()
  const { t } = useTranslation()
  const { compressImage } = useCompressImage()

  const handleOpen = () => {
    setIsEditingName(false)
    setEditedName(selectedTree?.name || '')
  }

  const handleToggleEdit = () => {
    if (isEditingName) {
      if (selectedTree && editedName.trim()) {
        void TreeService.updateTree({ ...selectedTree, name: editedName.trim() })
      }
      setIsEditingName(false)
    } else {
      setEditedName(selectedTree?.name || '')
      setIsEditingName(true)
    }
  }

  const actionItems = [
    {
      icon: Users,
      text: t('familyMemberList'),
      onPress: () => {
        navigate(`/tree/${selectedTree?.id}/members`)
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
      icon: Trash2,
      text: t('remove'),
      onPress: () => {
        setDeleteModalVisible(true)
      },
      destructive: true,
    },
  ]

  const deleteTree = async () => {
    if (selectedTree) {
      try {
        setIsDeleteLoading(true)
        await TreeService.deleteTree(selectedTree.id)
        removeTree(selectedTree.id)
        onClose()
        navigate('/(authenticated)')
      } catch (error) {
        console.error('Failed to delete family tree:', error)
        alert(t('failedToDeleteTree'))
      } finally {
        setDeleteModalVisible(false)
        setIsDeleteLoading(false)
      }
    }
  }

  const imageSource = selectedTree?.familyImageUrl
    ? { uri: selectedTree.familyImageUrl }
    : DUMMY_FAMILY

  const openImagePicker = () => {
    setSelectedImageUri(selectedTree?.familyImageUrl)
    setImageEditModalVisible(true)
  }

  const modalImageSource = selectedImageUri
    ? { uri: selectedImageUri }
    : imageSource

  const handleChangePhoto = async () => {
    if (!selectedTree) return

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== ImagePicker.PermissionStatus.GRANTED) {
      alert(t('cameraPermissionRequired'))

      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri
      setSelectedImageUri(imageUri)

      setIsUploading(true)
      try {
        const compressedUri = await compressImage(imageUri)
        const response = await TreeService.updateTreeImageById(
          selectedTree.id,
          compressedUri,
        )

        await TreeService.updateTree({ ...selectedTree, familyImageUrl: response.familyImageUrl })
        setImageEditModalVisible(false)
      } catch (error) {
        console.error('Failed to upload family picture:', error)
        alert(t('failedToUploadImage'))
      } finally {
        setIsUploading(false)
      }
    }
  }

  return (
    <>
      <ActionSheet isOpen={isOpen} onClose={onClose} onOpen={handleOpen}>
        {/* Header with family image and name */}
        <View className="flex-row items-center py-4 px-2">
          <Pressable onPress={openImagePicker}>
            <View className="w-16 h-16 rounded-full bg-primary-800 overflow-hidden mr-3">
              <Image
                source={imageSource}
                className="w-full h-full"
              />
            </View>
          </Pressable>
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
      </ActionSheet>
      <ImageEditModal
        visible={imageEditModalVisible}
        imageSource={modalImageSource}
        isUploading={isUploading}
        onChangePhoto={() => void handleChangePhoto()}
        onClose={() => setImageEditModalVisible(false)}
        t={t}
      />
      <Modal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        title={t('deleteTree', { treeName: selectedTree?.name })}
        button={{
          text: t('deleteTreeButton'),
          onPress: () => void deleteTree(),
          isDisabled: false,
          isLoading: isDeleteLoading,
          action: 'negative',
        }}
      >
        <VStack className="px-4 gap-2">
          <Text>
            {t('deleteTreeDescription')}
          </Text>
          <Text>
            {t('deleteTreeConfirmation', { treeName: selectedTree?.name })}
          </Text>
        </VStack>
      </Modal>
    </>
  )
}
