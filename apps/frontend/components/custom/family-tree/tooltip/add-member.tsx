import React from 'react'
import { View } from 'react-native'
import { Users, Heart, UsersRound, Baby } from 'lucide-react-native'

import { Text } from '@/components/ui/text'
import { HStack } from '@/components/ui/hstack'
import { VStack } from '@/components/ui/vstack'
import { useFamilyTree } from '@/hooks/useFamilyTree'

import { ActionButtonProps, AddMemberContentViewProps, MemberType } from './types'
import { ActionButton, sharedViewClassName } from './base'

export const AddMemberContentView: React.FC<AddMemberContentViewProps> = ({
  person,
  treeId,
  onSelectType,
  t,
}) => {
  if (!person) return null

  const { hasSpouse, isRoot } = useFamilyTree()
  const addActions: Array<{ key: MemberType } & ActionButtonProps> = [
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
