import { View, Image, Pressable, ScrollView } from 'react-native'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useUser } from '@/hooks/useUser'
import { useColorMode } from '@/hooks/useColorMode'
import { ListItems } from '@/components/custom/list-item'
import { BasicCard } from '@/components/custom/cards/basic-card'
import { VStack } from '@/components/ui/vstack'
import Modal from '@/components/custom/modals/modal'
import { ImageEditModal } from '@/components/custom/modals/image-edit-modal'
import { InputContent } from '@/components/custom/dialog-content/input-content'
import { useSettingListItem } from '@/hooks/useSettingListItem'
import { useCompressImage } from '@/hooks/useCompressImage'
import { UserService } from '@/services/userService'
import { ThemedDatePicker } from '@/components/custom/date-picker'
import DUMMY_MALE from '@/assets/images/dummy-profile-male.webp'
import * as ImagePicker from 'expo-image-picker'
import { ActionBar } from '@/components/custom/action-bar'
import { router } from 'expo-router'
import type { ColorMode } from '@/store/slices/app/types'
import i18n from '@/i18n/index'
import { changePasswordSchema } from '@/validator/auth/authValidation'

interface ModalConfig {
  type: 'input' | 'password' | 'datepicker'
  title: string
  prop: string
}

export default function Settings() {
  const { user, setUser } = useUser()
  const { t } = useTranslation()
  const { compressImage } = useCompressImage()
  const { colorMode, setColorMode } = useColorMode()

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null)
  const [imageEditModalVisible, setImageEditModalVisible] = useState(false)
  const [selectedImageUri, setSelectedImageUri] = useState<string | undefined>()
  const [isUploading, setIsUploading] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  if (!user) return null

  const onSettingPress = useCallback((id: string, detail?: string) => {
    if (!user) return

    if (detail != null && id !== 'colorTheme') {
      // Radio button change (e.g. language)
      if (id === 'language') {
        void i18n.changeLanguage(detail)
      }

      // Optimistically update user locally
      setUser({ ...user, [id]: detail } as typeof user)

      // Also persist to server (fire-and-forget)
      void UserService.updateProfile({ [id]: detail }).catch((error) => {
        console.error('Update failed:', error)
        alert(t('updateFailed'))
      })

      return
    }

    if (id === 'name') {
      setInputValue(user.name)
      setModalConfig({ type: 'input', title: t('name'), prop: 'name' })
      setIsModalVisible(true)
    } else if (id === 'password') {
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setModalConfig({ type: 'password', title: t('password'), prop: 'password' })
      setIsModalVisible(true)
    } else if (id === 'birthDate') {
      setModalConfig({ type: 'datepicker', title: t('birthDate'), prop: 'birthDate' })
      setIsModalVisible(true)
    }
  }, [user, t])

  const handleColorModeChange = useCallback((mode: ColorMode) => {
    setColorMode(mode)
  }, [setColorMode])

  const handleModalSave = useCallback(() => {
    if (!modalConfig) return

    void (async () => {
      try {
        if (modalConfig.type === 'password') {
          const updatedUser = await UserService.updateProfile({
            password: newPassword,
          })
          setUser(updatedUser)
        } else {
          const updatedUser = await UserService.updateProfile({
            [modalConfig.prop]: inputValue,
          })
          setUser(updatedUser)
        }
        setIsModalVisible(false)
      } catch (error) {
        console.error('Update failed:', error)
        alert(t('updateFailed'))
      }
    })()
  }, [modalConfig, inputValue, newPassword, setUser, t])

  const { listItems } = useSettingListItem({ user, t, colorMode, onPress: onSettingPress, onColorModeChange: handleColorModeChange })

  const openImagePicker = useCallback(() => {
    setSelectedImageUri(user?.avatarUrl)
    setImageEditModalVisible(true)
  }, [user])

  const handleChangePhoto = useCallback(async () => {
    if (!user) return

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
        const updatedUser = await UserService.updateProfileImage(compressedUri)
        setUser(updatedUser)
        setImageEditModalVisible(false)
      } catch (error) {
        console.error('Failed to upload profile picture:', error)
        alert(t('failedToUploadImage'))
      } finally {
        setIsUploading(false)
      }
    }
  }, [user, compressImage, setUser, t])

  const avatarSource = user.avatarUrl
    ? { uri: user.avatarUrl }
    : DUMMY_MALE

  const modalImageSource = selectedImageUri
    ? { uri: selectedImageUri }
    : avatarSource

  const passwordValidation = changePasswordSchema.safeParse({
    oldPassword: currentPassword,
    newPassword,
    confirmPassword,
  })
  const passwordErrors = !passwordValidation.success ? passwordValidation.error.flatten().fieldErrors : null

  const isSaveDisabled = modalConfig?.type === 'password'
    ? !passwordValidation.success
    : inputValue === ''

  const modalButton = modalConfig && modalConfig.type !== 'datepicker'
    ? {
        text: t('save'),
        onPress: handleModalSave,
        isDisabled: isSaveDisabled,
      }
    : undefined

  return (
    <View className="flex-1 bg-primary-0 pb-6">
      <ActionBar title={t('settings')} onBack={() => router.back()} />
      <ScrollView>
        <VStack className="flex-1 items-center justify-start w-full gap-3">
          {/* Avatar */}
          <Pressable onPress={openImagePicker}>
            <View className="w-36 h-36 rounded-full bg-secondary-500 overflow-hidden mt-4 mb-2 border-2 border-secondary-500">
              <Image
                source={avatarSource}
                className="w-36 h-36"
                resizeMode="cover"
                alt="Profile"
              />
            </View>
          </Pressable>

          {/* List Items */}
          {listItems.map(item => (
            <BasicCard key={item.category} category={t(item.category)}>
              <ListItems items={item.listItems} />
            </BasicCard>
          ))}
        </VStack>
      </ScrollView>

      {/* Edit Modal (name / password) */}
      <Modal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        title={modalConfig?.title}
        button={modalButton}
      >
        {modalConfig?.type === 'input' && (
          <InputContent
            inputValue={inputValue}
            setInputValue={setInputValue}
            placeholder={modalConfig.title}
          />
        )}
        {modalConfig?.type === 'password' && (
          <VStack className="w-full" space="md">
            <InputContent
              inputValue={currentPassword}
              setInputValue={setCurrentPassword}
              placeholder={t('currentPassword')}
              type="password"
              isInvalid={!!currentPassword && !!passwordErrors?.oldPassword}
              errorMessage={currentPassword ? passwordErrors?.oldPassword?.[0] : undefined}
            />
            <InputContent
              inputValue={newPassword}
              setInputValue={setNewPassword}
              placeholder={t('newPassword')}
              type="password"
              isInvalid={!!newPassword && !!passwordErrors?.newPassword}
              errorMessage={newPassword ? passwordErrors?.newPassword?.[0] : undefined}
            />
            <InputContent
              inputValue={confirmPassword}
              setInputValue={setConfirmPassword}
              placeholder={t('confirmPassword')}
              type="password"
              isInvalid={!!confirmPassword && !!passwordErrors?.confirmPassword}
              errorMessage={confirmPassword ? passwordErrors?.confirmPassword?.[0] : undefined}
            />
          </VStack>
        )}
        {modalConfig?.type === 'datepicker' && (
          <ThemedDatePicker
            value={user.birthDate ?? Date.now()}
            onChange={(date) => {
              void UserService.updateProfile({ birthDate: date.getTime() })
                .then(setUser)
                .catch((error) => {
                  console.error('Update failed:', error)
                  alert(t('updateFailed'))
                })
              setIsModalVisible(false)
            }}
            maximumDate={new Date()}
          />
        )}
      </Modal>

      {/* Image Edit Modal */}
      <ImageEditModal
        visible={imageEditModalVisible}
        imageSource={modalImageSource}
        isUploading={isUploading}
        onChangePhoto={() => void handleChangePhoto()}
        onClose={() => setImageEditModalVisible(false)}
        t={t}
      />
    </View>
  )
}
