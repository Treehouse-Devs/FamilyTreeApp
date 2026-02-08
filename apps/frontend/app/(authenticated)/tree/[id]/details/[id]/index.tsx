import { ActivityIndicator, View } from 'react-native'
import { ActionBar } from '@/components/custom/action-bar'
import { router, useLocalSearchParams } from 'expo-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TreeService } from '@/services/treeService'
import { useFamilyTree } from '@/hooks/useFamilyTree'
import type { DetailedPerson } from '@/store/slices/treeSlice'
import { mapPersonToListItem, PersonDetailListItems } from './utils'
import { ListItems } from '@/components/custom/list-item'
import { BasicCard } from '@/components/custom/cards/basic-card'
import { VStack } from '@/components/ui/vstack'
import { ScrollView } from 'react-native'
import { Input, InputField } from '@/components/ui/input'
import { Button, ButtonText } from '@/components/ui/button'
import Modal from '@/components/custom/modal'
import { ThemedDatePicker } from '@/components/custom/date-picker'

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
        const { person } = await TreeService.fetchPersonById(selectedTreeId, id)
        setPersonDetail(person)
        setPerson(selectedTreeId, id, person)
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

  useEffect(() => {
    if (personDetail) {
      const processedListItems = mapPersonToListItem(personDetail, t, onDetailPress)
      setListItems(processedListItems)
    }
  }, [personDetail, t])

  return (
    <View className="flex-1 bg-primary-0 pb-6">
      <ActionBar title={t('personDetail', { name: personDetail?.name ?? 'Person' })} onBack={() => router.back()} />
      {isLoading
        ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator />
            </View>
          )
        : (
            <ScrollView>
              <VStack className="flex-1 items-center justify-start w-full gap-3">
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
    </View>
  )
}

export default PersonDetailScreen
