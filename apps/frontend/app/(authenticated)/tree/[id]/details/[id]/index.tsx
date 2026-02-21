import { ActivityIndicator, View, Image, Pressable } from 'react-native'
import { ActionBar } from '@/components/custom/action-bar'
import { router, useLocalSearchParams } from 'expo-router'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useFamilyTree } from '@/hooks/useFamilyTree'
import type { DetailedPerson } from '@/store/slices/treeSlice'
import { handleImageUpload } from './utils'
import { ListItems } from '@/components/custom/list-item'
import { BasicCard } from '@/components/custom/cards/basic-card'
import { VStack } from '@/components/ui/vstack'
import { ScrollView } from 'react-native'
import Modal from '@/components/custom/modals/modal'
import { ImageEditModal } from '@/components/custom/modals/image-edit-modal'
import DUMMY_MALE from '@/assets/images/dummy-profile-male.webp'
import DUMMY_FEMALE from '@/assets/images/dummy-profile-female.webp'
import { usePersonDetail } from './usePersonDetail'
import { useListItem } from './useListItem'
import { useCompressImage } from '@/hooks/useCompressImage'
import { DatePickerContent } from './dialog-content/date-picker-content'
import { InputContent } from './dialog-content/input-content'

interface ModalConfig {
  type: 'input' | 'date'
  title: string
  prop: string
  category?: Category
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad'
}

export type Category = 'location' | 'occupation' | 'contact'
type PersonDetail = Pick<DetailedPerson, Category>

const blankPersonDetail: PersonDetail = {
  location: {
    nationality: '',
    hometown: '',
    domicile: '',
  },
  occupation: {
    occupation: '',
    officeAddress: '',
  },
  contact: {
    homeNumber: 0,
    phoneNumber: 0,
  },
}

const PersonDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { selectedTreeId, setPerson } = useFamilyTree()
  const { t } = useTranslation()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null)
  const [imageEditModalVisible, setImageEditModalVisible] = useState(false)
  const [selectedImageUri, setSelectedImageUri] = useState<string | undefined>()
  const [isUploading, setIsUploading] = useState(false)
  const [showThumbnailInActionBar, setShowThumbnailInActionBar] = useState(false)
  const { compressImage } = useCompressImage()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [inputValue, setInputValue] = useState<string>('')

  if (!selectedTreeId) {
    router.replace('/(authenticated)')

    return
  }

  const { personDetail, setPersonDetail, isLoading, sendUpdate } = usePersonDetail(id, selectedTreeId)

  const findCategoryForProp = (prop: string): Category | undefined => {
    return (Object.keys(blankPersonDetail) as Category[]).find((key) => {
      const categoryObj = blankPersonDetail[key]

      return Object.keys(categoryObj ?? {}).includes(prop)
    })
  }

  const onDetailPress = useCallback((prop: string, selectedId?: string) => {
    if (!personDetail) return

    const currCategory = findCategoryForProp(prop)
    const isDateField = prop === 'birthDate' || prop === 'deathDate'

    if (selectedId != null) {
      // Changing from radio buttons, e.g. gender
      console.log('prop:', prop, 'selectedId', selectedId)
      void sendUpdate(prop, currCategory, selectedId)
    } else {
      // Get current value from category or top-level
      let currValueStr = ''
      if (currCategory) {
        const categoryData = personDetail[currCategory]
        const currValue = categoryData?.[prop as keyof typeof categoryData]
        currValueStr = typeof currValue === 'string' || typeof currValue === 'number'
          ? String(currValue)
          : ''
      } else {
        const currValue = personDetail[prop as keyof DetailedPerson]
        currValueStr = typeof currValue === 'string' || typeof currValue === 'number'
          ? String(currValue)
          : ''
      }

      if (isDateField) {
        const currentDate = currValueStr ? Number(currValueStr) : undefined
        setSelectedDate(currentDate ? new Date(currentDate) : new Date())
        setModalConfig({
          type: 'date',
          title: t(prop),
          prop,
          category: currCategory,
        })
      } else {
        setInputValue(currValueStr)
        setModalConfig({
          type: 'input',
          title: t(prop),
          prop,
          category: currCategory,
          keyboardType: prop === 'phoneNumber' || prop === 'homeNumber' ? 'phone-pad' : 'default',
        })
      }
      setIsModalVisible(true)
    }
  }, [personDetail, t])

  const handleModalSave = useCallback(() => {
    if (!modalConfig) return

    const { prop, category } = modalConfig

    if (modalConfig.type === 'date') {
      void sendUpdate(prop, category, selectedDate.getTime())
    } else {
      const valueToSend = prop === 'phoneNumber' || prop === 'homeNumber' ? parseInt(inputValue) : inputValue
      void sendUpdate(prop, category, valueToSend)
    }
    setIsModalVisible(false)
  }, [modalConfig, selectedDate, inputValue, sendUpdate])

  const listItems = useListItem({ personDetail, t, onDetailPress })

  const openImagePicker = useCallback(() => {
    setSelectedImageUri(personDetail?.fullImageUrl)
    setImageEditModalVisible(true)
  }, [personDetail])

  const handleChangePhoto = useCallback(async () => {
    if (!personDetail) return

    await handleImageUpload({
      treeId: selectedTreeId,
      personId: id,
      t,
      compressImage,
      onImageSelect: (uri: string) => setSelectedImageUri(uri),
      onUploadStart: () => setIsUploading(true),
      onUploadSuccess: (fullImageUrl: string, imageThumbnailUrl: string) => {
        const editedPersonDetail: DetailedPerson = {
          ...personDetail,
          fullImageUrl,
          imageThumbnailUrl,
        }
        setPersonDetail(editedPersonDetail)
        setPerson(selectedTreeId, id, editedPersonDetail)
        setImageEditModalVisible(false)
      },
      onUploadError: (error: unknown) => {
        console.error('Failed to upload profile picture:', error)
        alert(t('failedToUploadImage'))
      },
      onUploadComplete: () => setIsUploading(false),
    })
  }, [personDetail, selectedTreeId, id, setPerson, t])

  const handleScroll = useCallback((event: { nativeEvent: { contentOffset: { y: number } } }) => {
    const scrollY = event.nativeEvent.contentOffset.y
    // Show thumbnail when scrolled past approximately 135px (profile image height + margin)
    setShowThumbnailInActionBar(scrollY > 135)
  }, [])

  const thumbnailSource = personDetail?.fullImageUrl
    ? { uri: personDetail.fullImageUrl }
    : (personDetail?.gender === 'female' ? DUMMY_FEMALE : DUMMY_MALE)

  const modalImageSource = selectedImageUri
    ? { uri: selectedImageUri }
    : thumbnailSource

  const modalButton = modalConfig
    ? {
        text: t('save'),
        onPress: handleModalSave,
        isDisabled: modalConfig.type === 'input' && inputValue === '',
      }
    : undefined

  return (
    <View className="flex-1 bg-primary-0">
      <ActionBar
        title={t('personDetail', { name: personDetail?.name ?? 'Person' })}
        onBack={() => router.back()}
        thumbnailSource={thumbnailSource}
        showThumbnail={showThumbnailInActionBar}
      />
      {isLoading
        ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator />
            </View>
          )
        : (
            <ScrollView onScroll={handleScroll} scrollEventThrottle={16}>
              <VStack className="flex-1 items-center justify-start w-full gap-3">
                <Pressable onPress={openImagePicker}>
                  <View className="w-36 h-36 rounded-full bg-secondary-500 overflow-hidden mt-4 mb-2 border-2 border-secondary-500">
                    <Image
                      source={personDetail?.fullImageUrl ? { uri: personDetail.fullImageUrl } : (personDetail?.gender === 'female' ? DUMMY_FEMALE : DUMMY_MALE)}
                      className="w-36 h-36"
                      resizeMode="cover"
                    />
                  </View>
                </Pressable>
                {
                  listItems.map(item => (
                    <BasicCard key={item.category} category={item.category}>
                      <ListItems {...item} />
                    </BasicCard>
                  ))
                }
              </VStack>
            </ScrollView>
          )}
      <Modal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        title={modalConfig?.title}
        button={modalButton}
      >
        {modalConfig?.type === 'date' && (
          <DatePickerContent
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
        )}
        {modalConfig?.type === 'input' && (
          <InputContent
            inputValue={inputValue}
            setInputValue={setInputValue}
            placeholder={modalConfig.title}
            keyboardType={modalConfig.keyboardType}
          />
        )}
      </Modal>
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

export default PersonDetailScreen
