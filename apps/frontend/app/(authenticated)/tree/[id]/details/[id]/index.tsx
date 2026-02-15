import { ActivityIndicator, View, Image, Pressable } from 'react-native'
import { ActionBar } from '@/components/custom/action-bar'
import { router, useLocalSearchParams } from 'expo-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TreeService } from '@/services/treeService'
import { useFamilyTree } from '@/hooks/useFamilyTree'
import type { DetailedPerson } from '@/store/slices/treeSlice'
import { mapPersonToListItem, PersonDetailListItems, handleImageUpload } from './utils'
import { ListItems } from '@/components/custom/list-item'
import { BasicCard } from '@/components/custom/cards/basic-card'
import { VStack } from '@/components/ui/vstack'
import { ScrollView } from 'react-native'
import { Input, InputField } from '@/components/ui/input'
import { Button, ButtonText } from '@/components/ui/button'
import Modal from '@/components/custom/modal'
import { ThemedDatePicker } from '@/components/custom/date-picker'
import { ImageEditModal } from '@/components/custom/modals/image-edit-modal'
import DUMMY_MALE from '@/assets/images/dummy-profile-male.webp'
import DUMMY_FEMALE from '@/assets/images/dummy-profile-female.webp'

interface ModalConfig {
  title: string
  content: React.ReactNode
}

type Category = 'location' | 'occupation' | 'contact'
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

const DatePickerContent = ({
  initialDate,
  onSave,
  t,
}: {
  initialDate?: number
  onSave: (timestamp: number) => void
  t: (key: string) => string
}) => {
  const [selectedDate, setSelectedDate] = useState(initialDate ? new Date(initialDate) : new Date())

  const handleDateChange = (date: Date) => {
    setSelectedDate(date)
  }

  return (
    <VStack className="w-full items-center" space="lg">
      <ThemedDatePicker
        value={selectedDate}
        onChange={handleDateChange}
      />
      <Button onPress={() => onSave(selectedDate.getTime())} className="w-[6rem] mx-4">
        <ButtonText>{t('save')}</ButtonText>
      </Button>
    </VStack>
  )
}

const PersonDetailScreen = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [personDetail, setPersonDetail] = useState<DetailedPerson | null>(null)
  const [listItems, setListItems] = useState<PersonDetailListItems>([])
  const { id } = useLocalSearchParams<{ id: string }>()
  const { selectedTreeId, getPerson, setPerson } = useFamilyTree()
  const { t } = useTranslation()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null)
  const [imageEditModalVisible, setImageEditModalVisible] = useState(false)
  const [selectedImageUri, setSelectedImageUri] = useState<string | undefined>()
  const [isUploading, setIsUploading] = useState(false)
  const [showThumbnailInActionBar, setShowThumbnailInActionBar] = useState(false)
  const inputValueRef = useRef('')

  if (!selectedTreeId) {
    router.replace('/(authenticated)')

    return
  }

  useEffect(() => {
    const fetchPerson = async () => {
      const person = getPerson(selectedTreeId, id)
      if (person && (person.location || person.occupation || person.contact)) {
        setPersonDetail(person)
      } else {
        const treePerson = getPerson(selectedTreeId, id)
        const { person: fetchedPerson } = await TreeService.fetchPersonById(selectedTreeId, id)
        // Merge fetched data with tree person to preserve gender and other tree fields
        const mergedPerson = { ...fetchedPerson, gender: treePerson?.gender }
        setPersonDetail(mergedPerson)
        setPerson(selectedTreeId, id, mergedPerson)
      }
      setIsLoading(false)
    }
    void fetchPerson()
  }, [selectedTreeId])

  const sendUpdate = async (prop: string, category: Category | undefined, value: string | number) => {
    if (personDetail) {
      try {
        let editedPersonDetail: DetailedPerson

        if (category) {
          // Nested property (location, contact, occupation)
          editedPersonDetail = {
            ...personDetail,
            [category]: {
              ...personDetail[category],
              [prop]: value,
            },
          }
        } else {
          // Top-level property (name, gender, birthDate, etc.)
          if (prop === 'isStillAliveQ') {
            // change deathDate to undefined if value is stillAlive and to today date if set to notAlive
            editedPersonDetail = {
              ...personDetail,
              deathDate: value === 'stillAlive' ? undefined : new Date().getTime(),
            }
          } else {
            editedPersonDetail = {
              ...personDetail,
              [prop]: value,
            }
          }
        }

        setPersonDetail(editedPersonDetail)
        setPerson(selectedTreeId, id, editedPersonDetail)
        await TreeService.patchPersonById(selectedTreeId, id, editedPersonDetail)
      } catch (error) {
        console.error('Patch API error:', error)
      }
    }
  }

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

      inputValueRef.current = currValueStr

      if (isDateField) {
        // Date picker modal
        const currentDate = currValueStr ? Number(currValueStr) : undefined

        const onSaveDatePress = (timestamp: number) => {
          void sendUpdate(prop, currCategory, timestamp)
          setIsModalVisible(false)
        }

        setModalConfig({
          title: t(prop),
          content: (
            <DatePickerContent
              initialDate={currentDate}
              onSave={onSaveDatePress}
              t={t}
            />
          ),
        })
      } else {
        // Text input modal
        const onSaveButtonPress = () => {
          void sendUpdate(prop, currCategory, inputValueRef.current)
          setIsModalVisible(false)
        }

        setModalConfig({
          title: t(prop),
          content: (
            <VStack className="w-full items-center px-4" space="lg">
              <Input className="w-full">
                <InputField
                  className="w-full"
                  keyboardType={prop === 'phoneNumber' || prop === 'homeNumber' ? 'phone-pad' : 'default'}
                  defaultValue={currValueStr}
                  onChangeText={(text) => { inputValueRef.current = text }}
                />
              </Input>
              <Button onPress={onSaveButtonPress} className="w-[6rem] mx-4">
                <ButtonText>{t('save')}</ButtonText>
              </Button>
            </VStack>
          ),
        })
      }
      setIsModalVisible(true)
    }
  }, [personDetail, t])

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

  useEffect(() => {
    if (personDetail) {
      const processedListItems = mapPersonToListItem(personDetail, t, onDetailPress)
      setListItems(processedListItems)
    }
  }, [personDetail, t])

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
      >
        {modalConfig?.content}
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
