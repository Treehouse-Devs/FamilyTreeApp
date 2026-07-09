import { View, Image, FlatList, useWindowDimensions } from 'react-native'
import { ActionBar } from '@/components/custom/action-bar'
import { router, useLocalSearchParams } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useFamilyTree } from '@/hooks/useFamilyTree'
import { BasicCard } from '@/components/custom/cards/basic-card'
import { VStack } from '@/components/ui/vstack'
import { HStack } from '@/components/ui/hstack'
import { Text } from '@/components/ui/text'
import { Button, ButtonText, ButtonIcon } from '@/components/ui/button'
import DUMMY_MALE from '@/assets/images/dummy-profile-male.webp'
import DUMMY_FEMALE from '@/assets/images/dummy-profile-female.webp'
import { getAgeInfo } from '@/utils/date'
import type { Person } from '@/store/slices/tree/types'
import { useMemo } from 'react'
import { ArrowDownAZ, ArrowUpAZ, ArrowDown01, ArrowUp01 } from 'lucide-react-native'
import { Gender } from '@treely/dto'

const getNumColumns = (width: number) => {
  if (width >= 1280) return 4
  if (width >= 1024) return 3

  return 2
}

const MemberListScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { flatPersons, memberSortField, memberSortDirection, setMemberSort } = useFamilyTree()
  const { t } = useTranslation()
  const { width } = useWindowDimensions()

  const numColumns = getNumColumns(width)

  const personsMap = flatPersons[id]
  const persons = personsMap ? Object.values(personsMap) as Person[] : []

  const sortedPersons = useMemo(() => {
    const sorted = [...persons].sort((a, b) => {
      if (memberSortField === 'name') {
        return a.name.localeCompare(b.name)
      }

      // Members without a birth date sort last (ascending).
      return (a.birthDate ?? Infinity) - (b.birthDate ?? Infinity)
    })

    return memberSortDirection === 'desc' ? sorted.reverse() : sorted
  }, [persons, memberSortField, memberSortDirection])

  const toggleSortField = (field: 'name' | 'birthYear') => {
    if (memberSortField === field) {
      setMemberSort(field, memberSortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setMemberSort(field, 'asc')
    }
  }

  const navigateToDetail = (personId: string) => {
    router.push(`/(authenticated)/tree/${id}/details/${personId}`)
  }

  const SortIcon = memberSortField === 'name'
    ? (memberSortDirection === 'asc' ? ArrowDownAZ : ArrowUpAZ)
    : (memberSortDirection === 'asc' ? ArrowDown01 : ArrowUp01)

  const renderItem = ({ item: person }: { item: Person }) => {
    const imageSource = person.imageThumbnailUrl
      ? { uri: person.imageThumbnailUrl }
      : person.gender === Gender.FEMALE
        ? DUMMY_FEMALE
        : DUMMY_MALE

    return (
      <View style={{ width: `${100 / numColumns}%` }}>
        <BasicCard
          onPress={() => navigateToDetail(person.id)}
          className="py-3 px-2"
        >
          <VStack className="items-center gap-2">
            {/* Profile Image */}
            <View className="w-16 h-16 rounded-full bg-secondary-500 overflow-hidden">
              <Image
                source={imageSource}
                className="w-16 h-16"
                resizeMode="cover"
              />
            </View>

            {/* Name and Age/Death */}
            <VStack className="items-center">
              <Text className="text-secondary-900 font-heading text-base text-center" numberOfLines={1}>
                {person.name}
              </Text>
              <Text className="text-secondary-700 text-sm text-center">
                {getAgeInfo(person.birthDate, person.deathDate, t)}
              </Text>
            </VStack>
          </VStack>
        </BasicCard>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-primary-0">
      <ActionBar title={t('familyMemberList')} onBack={() => router.back()} className="mb-6" />

      {/* Sort Bar */}
      <HStack className="px-4 mb-4 gap-2 items-center">
        <Button
          size="sm"
          variant={memberSortField === 'birthYear' ? 'solid' : 'outline'}
          action="primary"
          onPress={() => toggleSortField('birthYear')}
          className="rounded-full"
        >
          <ButtonText className={memberSortField === 'birthYear' ? 'font-bold' : 'font-heading'}>{t('sortByBirthYear')}</ButtonText>
          {memberSortField === 'birthYear' && <ButtonIcon as={SortIcon} />}
        </Button>

        <Button
          size="sm"
          variant={memberSortField === 'name' ? 'solid' : 'outline'}
          action="primary"
          onPress={() => toggleSortField('name')}
          className="rounded-full"
        >
          <ButtonText className={memberSortField === 'name' ? 'font-bold' : 'font-heading'}>{t('sortByName')}</ButtonText>
          {memberSortField === 'name' && <ButtonIcon as={SortIcon} />}
        </Button>
      </HStack>

      <FlatList
        key={numColumns}
        data={sortedPersons}
        renderItem={renderItem}
        keyExtractor={person => person.id}
        numColumns={numColumns}
        contentContainerStyle={{ paddingHorizontal: 10, gap: 12, paddingBottom: 24 }}
      />
    </View>
  )
}

export default MemberListScreen
