import { useTranslation } from 'react-i18next'
import { useFetchTrees } from './useFetchTrees'
import { useCallback, useEffect, useState } from 'react'
import { useFetchUser } from './useFetchUser'
import { FlatList, useWindowDimensions, View } from 'react-native'
import { ActionBar } from '@/components/custom/action-bar'
import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar'
import { NoTree } from '@/components/custom/main-page/no-tree'
import type { Tree } from '@/store/slices/tree/types'
import { BasicCard } from '@/components/custom/cards/basic-card'
import { router } from 'expo-router'
import { VStack } from '@/components/ui/vstack'
import DUMMY_FAMILY from '@/assets/images/dummy-family.webp'
import DUMMY_MALE from '@/assets/images/dummy-profile-male.webp'
import { Image } from '@/components/ui/image'
import { Text } from '@/components/ui/text'
import { Plus } from 'lucide-react-native'
import Modal from '@/components/custom/modals/modal'
import { Input, InputField } from '@/components/ui/input'
import { Button, ButtonIcon } from '@/components/ui/button'
import { MainPageActionSheet } from '@/components/custom/main-page/action-sheet'
import { Pressable } from '@/components/ui/pressable'
import { Skeleton, SkeletonText } from '@/components/ui/skeleton'

const getNumColumns = (width: number) => {
  if (width >= 1280) return 4
  if (width >= 1024) return 3

  return 2
}

const App = () => {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(true)
  const [isTreeFetched, setIsTreeFetched] = useState(false)
  const [isUserFetched, setIsUserFetched] = useState(false)
  const { trees, createTree } = useFetchTrees({ setIsTreeFetched })
  const { user } = useFetchUser({ setIsUserFetched })
  const [isCreateTreeModalVisible, setIsCreateTreeModalVisible] = useState(false)
  const [newTreeName, setNewTreeName] = useState('')
  const [isCreateTreeModalLoading, setIsCreateTreeModalLoading] = useState(false)
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false)

  useEffect(() => {
    if (isTreeFetched && isUserFetched) {
      setIsLoading(false)
    }
  }, [isTreeFetched, isUserFetched])

  const createNewTree = useCallback(() => {
    setIsCreateTreeModalVisible(true)
  }, [])

  const avatarSource = user?.avatarUrl
    ? { uri: user.avatarUrl }
    : (!user?.name || user.name.trim() === '' ? DUMMY_MALE : undefined)

  const avatarIcon = (
    <Pressable onPress={() => setIsActionSheetOpen(true)} className="data-[active=true]:scale-95 transition-transform duration-200 ease-in-out">
      <Avatar>
        <AvatarFallbackText>{user?.name}</AvatarFallbackText>
        <AvatarImage source={avatarSource} />
      </Avatar>
    </Pressable>
  )

  const { width } = useWindowDimensions()
  const numColumns = getNumColumns(width)

  const navigateToDetail = useCallback((id: string) => {
    router.push(`/tree/${id}`)
  }, [])

  const onCreateTreePressed = useCallback(() => {
    setIsCreateTreeModalLoading(true)
    createTree(newTreeName).then((tree) => {
      if (tree) {
        navigateToDetail(tree.id)
      }
    }).catch((error) => {
      console.error('Failed to create tree:', error)
    }).finally(() => {
      setIsCreateTreeModalLoading(false)
      setIsCreateTreeModalVisible(false)
    })
  }, [createTree, newTreeName, navigateToDetail])

  const renderTreeCard = (tree: Tree | 'create' | 'loading') => {
    if (tree === 'loading') {
      return (
        <View style={{ width: `${100 / numColumns}%` }}>
          <BasicCard className="py-4 px-2">
            <VStack className="items-center gap-3">
              {/* Skeleton Circle Image */}
              <Skeleton variant="circular" className="w-14 h-14 rounded-full" />
              {/* Skeleton Text */}
              <SkeletonText _lines={1} className="h-5 w-24 rounded-md mt-1" />
            </VStack>
          </BasicCard>
        </View>
      )
    }

    const imageSource = tree === 'create' ? '' : tree.familyImageUrl || DUMMY_FAMILY

    return (
      <View style={{ width: `${100 / numColumns}%` }}>
        <BasicCard
          onPress={() => {
            if (tree === 'create') {
              createNewTree()
            } else {
              navigateToDetail(tree.id)
            }
          }}
          className={`py-4 px-2 ${tree === 'create' ? 'border-dashed' : ''}`}
        >
          <VStack className="items-center gap-3">
            {/* Family Tree Image */}
            <View className="w-14 h-14 overflow-hidden flex items-center justify-center">
              {tree === 'create'
                ? (
                    <Button onPress={createNewTree} className="w-10 h-10 flex bg-secondary-500 items-center justify-center rounded-full" action="secondary">
                      <ButtonIcon as={Plus} className="text-secondary-50 w-9 h-9" />
                    </Button>
                  )
                : (
                    <Image
                      source={imageSource}
                      className="w-14 h-14 rounded-full"
                      resizeMode="cover"
                      alt="Family Tree"
                    />
                  )}
            </View>

            {/* Family Name */}
            <Text className="text-secondary-900 font-heading text-base text-center" numberOfLines={1}>
              {tree === 'create' ? t('createNew') : tree.name}
            </Text>
          </VStack>
        </BasicCard>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-primary-0">
      <ActionBar
        title={t('familyTree')}
        rightIconSlot={avatarIcon}
        className="px-6 mb-8"
      />
      {isLoading
        ? (
            <FlatList
              data={['loading-1', 'loading-2'] as const}
              renderItem={() => renderTreeCard('loading')}
              keyExtractor={item => item}
              numColumns={numColumns}
              contentContainerStyle={{ paddingHorizontal: 10, gap: 12, paddingBottom: 24 }}
            />
          )
        : trees.length === 0
          ? (
              <NoTree createNewTree={createNewTree} />
            )
          : (
              <FlatList
                data={[...trees, 'create']}
                renderItem={({ item }) => renderTreeCard(item)}
                keyExtractor={(item: Tree | 'create') => item === 'create' ? 'create' : item.id}
                numColumns={numColumns}
                contentContainerStyle={{ paddingHorizontal: 10, gap: 12, paddingBottom: 24 }}
              />
            )}
      {isCreateTreeModalVisible && (
        <Modal
          visible={isCreateTreeModalVisible}
          onClose={() => setIsCreateTreeModalVisible(false)}
          title={t('createNewFamilyTree')}
          button={{
            text: t('create'),
            onPress: onCreateTreePressed,
            isDisabled: !newTreeName || newTreeName.trim().length === 0 || isCreateTreeModalLoading,
          }}
        >
          <VStack className="w-full items-center px-4" space="lg">
            <Input>
              <InputField
                value={newTreeName}
                onChangeText={setNewTreeName}
                placeholder={t('enterTreeName')}
              />
            </Input>
          </VStack>
        </Modal>
      )}
      <MainPageActionSheet isOpen={isActionSheetOpen} onClose={() => setIsActionSheetOpen(false)} />
    </View>
  )
}

export default App
