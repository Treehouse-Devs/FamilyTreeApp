import React from 'react'
import { View, Image } from 'react-native'
import { UserPlus, ContactRound, Trash2 } from 'lucide-react-native'

import { Text } from '@/components/ui/text'
import { HStack } from '@/components/ui/hstack'
import { useFamilyTree } from '@/hooks/useFamilyTree'

import type { ActionButtonProps, MainContentViewProps } from './types'
import { ActionButton } from './base'

import DUMMY_MALE from '@/assets/images/dummy-profile-male.webp'
import DUMMY_FEMALE from '@/assets/images/dummy-profile-female.webp'
import { Gender } from '@treely/dto'

export const MainContentView: React.FC<MainContentViewProps> = ({
  treeId,
  person,
  year,
  ageText,
  onAddPress,
  isAddMemberDisabled,
  onDetailsPress,
  onDeletePress,
  t,
}) => {
  const { isRoot } = useFamilyTree()

  const actions: Array<{ key: string } & ActionButtonProps> = [
    {
      key: 'add',
      icon: UserPlus,
      label: t('add'),
      onPress: onAddPress,
      isDisabled: isAddMemberDisabled,
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
      isDisabled: isRoot(treeId, person.id),
    },
  ]

  return (
    <View
      className="flex flex-col items-center"
      onStartShouldSetResponder={() => true}
    >
      {/* Profile Image */}
      <View className="w-14 h-14 rounded-full bg-secondary-500 overflow-hidden mt-3 mb-1">
        <Image
          source={person.imageThumbnailUrl ? { uri: person.imageThumbnailUrl } : (person.gender === Gender.FEMALE ? DUMMY_FEMALE : DUMMY_MALE)}
          className="w-14 h-14"
          resizeMode="cover"
        />
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
            isDisabled={action.isDisabled}
          />
        ))}
      </HStack>
    </View>
  )
}
