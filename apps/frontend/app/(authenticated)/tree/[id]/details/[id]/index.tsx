import { ActivityIndicator, View } from 'react-native'
import { ActionBar } from '@/components/custom/action-bar'
import { router, useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TreeService } from '@/services/treeService'
import { useFamilyTree } from '@/hooks/useFamilyTree'
import type { Person } from '@/store/slices/treeSlice'
import { mapPersonToListItem, PersonDetailListItems } from './utils'
import { ListItems } from '@/components/custom/list-item'
import { BasicCard } from '@/components/custom/cards/basic-card'
import { VStack } from '@/components/ui/vstack'
import { ScrollView } from 'react-native'

const PersonDetailScreen = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [personDetail, setPersonDetail] = useState<Person | null>(null)
  const [listItems, setListItems] = useState<PersonDetailListItems>([])
  const { id } = useLocalSearchParams<{ id: string }>()
  const { selectedTreeId } = useFamilyTree()
  const { t } = useTranslation()

  if (!selectedTreeId) {
    router.replace('/(authenticated)')

    return
  }

  useEffect(() => {
    const fetchPerson = async () => {
      const { person } = await TreeService.fetchPersonById(selectedTreeId, id)
      setPersonDetail(person)
      setIsLoading(false)
    }
    void fetchPerson()
  }, [selectedTreeId])

  useEffect(() => {
    if (personDetail) {
      setListItems(mapPersonToListItem(personDetail, t, () => {}))
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
    </View>
  )
}

export default PersonDetailScreen
