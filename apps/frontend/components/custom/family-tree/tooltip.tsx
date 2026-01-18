import React, { useState } from 'react'
import { Modal, Pressable, View, Image } from 'react-native'
import Animated, { Easing, FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated'
import { UserPlus, ContactRound, Trash2, Users, Heart, UsersRound, Baby } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'

import { Text } from '@/components/ui/text'
import { HStack } from '@/components/ui/hstack'
import { VStack } from '@/components/ui/vstack'
import { Person } from '@/store/slices/treeSlice'
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button'

export type MemberType = 'parents' | 'spouse' | 'sibling' | 'children'

type PersonTooltipProps = {
  person: Person | null
  visible: boolean
  treeId: string
  onClose: () => void
  onAddMember: (type: MemberType) => void
  onViewDetails: () => void
}

const sharedViewClassName = 'bg-secondary-0 rounded-2xl border-2 border-secondary-500 px-[0.75rem] py-[0.625rem] items-center shadow-lg elevation-lg'

type ActionButtonProps = {
  icon: React.ElementType
  label: string
  onPress: () => void
  isDestructive?: boolean
  isWide?: boolean
  isDisabled?: boolean
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon, label, onPress, isDestructive, isWide, isDisabled }) => {
  const activeColor = isDestructive ? 'data-[active=true]:bg-red-300/30' : 'data-[active=true]:bg-primary-50/60'
  const buttonWidth = isWide ? 'w-[90px]' : 'w-[60px]'
  const disabledOpacity = isDisabled ? '/50' : ''

  return (
    <Button
      variant="link"
      action="default"
      onPress={onPress}
      disabled={isDisabled}
      className={`flex flex-col items-center justify-center ${buttonWidth} h-[60px] p-0 rounded-md ${activeColor}`}
    >
      <ButtonIcon as={icon} size="lg" className={`${isDestructive ? `text-red-600${disabledOpacity}` : `text-primary-700${disabledOpacity}`}`} />
      <Text className={`text-sm font-medium ${isDestructive ? `text-red-600${disabledOpacity}` : `text-primary-700${disabledOpacity}`}`}>
        {label}
      </Text>
    </Button>
  )
}

import { getYear, getAge } from '@/utils/date'
import { useFamilyTree } from '@/hooks/useFamilyTree'

type ContentView = 'main' | 'addMember' | 'removeMember'

type MainContentViewProps = {
  person: Person
  year: string
  ageText: string
  onAddPress: () => void
  onDetailsPress: () => void
  onDeletePress: () => void
  t: (key: string) => string
}

const MainContentView: React.FC<MainContentViewProps> = ({
  person,
  year,
  ageText,
  onAddPress,
  onDetailsPress,
  onDeletePress,
  t,
}) => {
  const actions: Array<{ key: string, icon: React.ElementType, label: string, onPress: () => void, isDestructive?: boolean }> = [
    {
      key: 'add',
      icon: UserPlus,
      label: t('add'),
      onPress: onAddPress,
    },
    {
      key: 'details',
      icon: ContactRound,
      label: t('details'),
      onPress: onDetailsPress,
    },
    {
      key: 'remove',
      icon: Trash2,
      label: t('remove'),
      onPress: onDeletePress,
      isDestructive: true,
    },
  ]

  return (
    <View
      className={sharedViewClassName}
      onStartShouldSetResponder={() => true}
    >
      {/* Profile Image */}
      <View className="w-14 h-14 rounded-full bg-secondary-500 overflow-hidden mt-3 mb-1">
        {person.imageThumbnailUrl
          ? (
              <Image
                source={{ uri: person.imageThumbnailUrl }}
                className="w-14 h-14"
                resizeMode="cover"
              />
            )
          : (
              <View className="w-14 h-14 bg-secondary-500 justify-center items-center">
                <Text className="text-2xl text-secondary-0">
                  {person.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
      </View>

      {/* Name */}
      <Text className="text-lg font-heading text-secondary-900 mb-1">
        {person.name}
      </Text>

      {/* Year and Age */}
      <HStack space="xs" className="items-center mb-4">
        <Text className="text-sm font-medium text-secondary-900">{year}</Text>
        <Text className="text-sm font-medium text-secondary-900">|</Text>
        <Text className="text-sm font-medium text-secondary-900">{ageText}</Text>
      </HStack>

      {/* Action Buttons */}
      <HStack space="xs">
        {actions.map(action => (
          <ActionButton
            key={action.key}
            icon={action.icon}
            label={action.label}
            onPress={action.onPress}
            isDestructive={action.isDestructive}
          />
        ))}
      </HStack>
    </View>
  )
}

type AddMemberContentViewProps = {
  person: Person | null
  treeId: string
  onSelectType: (type: MemberType) => void
  t: (key: string) => string
}

const AddMemberContentView: React.FC<AddMemberContentViewProps> = ({
  person,
  treeId,
  onSelectType,
  t,
}) => {
  if (!person) return null

  const { hasSpouse, isRoot } = useFamilyTree()
  const addActions: Array<{ key: MemberType, icon: React.ElementType, label: string, isDisabled?: boolean }> = [
    {
      key: 'parents',
      icon: Users,
      label: t('parents'),
      isDisabled: !isRoot(treeId, person.id),
    },
    {
      key: 'spouse',
      icon: Heart,
      label: t('spouse'),
      isDisabled: hasSpouse(treeId, person.id),
    },
    {
      key: 'sibling',
      icon: UsersRound,
      label: t('sibling'),
      isDisabled: !person.isBloodRelated,
    },
    {
      key: 'children',
      icon: Baby,
      label: t('children'),
      isDisabled: false,
    },
  ]

  return (
    <View
      className={sharedViewClassName}
      onStartShouldSetResponder={() => true}
    >
      <Text className="text-lg font-heading text-secondary-900 mb-4 px-2">
        {t('addFamilyMember')}
      </Text>

      {/* 2x2 Grid */}
      <VStack space="md">
        <HStack space="xs">
          {addActions.slice(0, 2).map(action => (
            <ActionButton
              key={action.key}
              icon={action.icon}
              label={action.label}
              onPress={() => onSelectType(action.key)}
              isWide
              isDisabled={action.isDisabled}
            />
          ))}
        </HStack>
        <HStack space="xs">
          {addActions.slice(2, 4).map(action => (
            <ActionButton
              key={action.key}
              icon={action.icon}
              label={action.label}
              onPress={() => onSelectType(action.key)}
              isWide
            />
          ))}
        </HStack>
      </VStack>
    </View>
  )
}

type RemovePersonContentViewProps = {
  person: Person
  treeId: string
  onClose: () => void
  t: (key: string) => string
}

export const RemovePersonContentView: React.FC<RemovePersonContentViewProps> = ({
  person,
  treeId,
  onClose,
  t,
}) => {
  const { collectAllDependents } = useFamilyTree()
  const dependents = collectAllDependents(treeId, person.id).filter((dependent: Person) => dependent.id !== person.id)

  // call remove person API
  const removePerson = () => {
    try {
      // TODO call remove person API
      // await removePersonApi(person.id)
      onClose()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <View
      className={sharedViewClassName}
      onStartShouldSetResponder={() => true}
    >
      <Text className="text-lg font-heading text-secondary-900 mb-4 px-2">
        {t('confirmRemove')}
      </Text>
      <Text className="text-base font-body text-secondary-700 mb-4 px-2">
        {dependents.length > 0 ? t('confirmRemoveDescriptionWithDependents') : t('confirmRemoveDescription')}
      </Text>
      <VStack space="sm" className="w-full px-4 mb-4">
        {dependents.map((dependent: Person) => (
          <View key={dependent.id} className="flex-row items-center gap-2">
            <Text className="text-base text-secondary-700">•</Text>
            <Text className="text-base text-secondary-700">
              {dependent.name}
            </Text>
          </View>
        ))}
      </VStack>
      <HStack space="sm">
        <Button
          variant="outline"
          onPress={onClose}
        >
          <ButtonText>
            {t('cancel')}
          </ButtonText>
        </Button>
        <Button
          onPress={() => {
            removePerson()
            onClose()
          }}
          action="negative"
        >
          <ButtonText>
            {t('remove')}
          </ButtonText>
        </Button>
      </HStack>
    </View>
  )
}

export const PersonTooltip: React.FC<PersonTooltipProps> = ({
  person,
  visible,
  treeId,
  onClose,
  onAddMember,
  onViewDetails,
}) => {
  const { t } = useTranslation()
  const [currentView, setCurrentView] = useState<ContentView>('main')

  if (!person) return null

  const year = getYear(person.birthDate)
  const age = getAge(person.birthDate, person.deathDate)
  const ageText = person.deathDate
    ? t('deceased', { year: getYear(person.deathDate) })
    : t('age', { years: age })

  const handleClose = () => {
    onClose()
  }

  const handleAddPress = () => {
    setCurrentView('addMember')
  }

  const handleSelectMemberType = (type: MemberType) => {
    onAddMember?.(type)
    handleClose()
  }

  const handleRemovePress = () => {
    setCurrentView('removeMember')
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      onRequestClose={handleClose}
    >
      <Pressable
        className="flex-1 bg-black/30 justify-center items-center"
        onPress={handleClose}
      >
        <Animated.View layout={LinearTransition.duration(150).easing(Easing.ease)}>
          {currentView === 'main'
            ? (
                <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(100)}>
                  <MainContentView
                    person={person}
                    year={year}
                    ageText={ageText}
                    onAddPress={handleAddPress}
                    onDetailsPress={() => {
                      onViewDetails?.()
                      handleClose()
                    }}
                    onDeletePress={handleRemovePress}
                    t={t}
                  />
                </Animated.View>
              )
            : currentView === 'addMember'
              ? (
                  <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(100)}>
                    <AddMemberContentView
                      onSelectType={handleSelectMemberType}
                      person={person}
                      treeId={treeId}
                      t={t}
                    />
                  </Animated.View>
                )
              : currentView === 'removeMember'
                ? (
                    <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(100)}>
                      <RemovePersonContentView
                        person={person}
                        treeId={treeId}
                        onClose={onClose}
                        t={t}
                      />
                    </Animated.View>
                  )
                : null }
        </Animated.View>
      </Pressable>
    </Modal>
  )
}
