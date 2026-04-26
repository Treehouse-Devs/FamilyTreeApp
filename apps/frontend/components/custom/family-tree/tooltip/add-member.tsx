import React from 'react'
import { View } from 'react-native'
import { Users, Heart, UsersRound, Baby } from 'lucide-react-native'

import { Text } from '@/components/ui/text'
import { HStack } from '@/components/ui/hstack'
import { VStack } from '@/components/ui/vstack'
import { useFamilyTree } from '@/hooks/useFamilyTree'

import type { ActionButtonProps, AddMemberContentViewProps } from './types'
import { MemberType } from './types'
import { ActionButton } from './base'
import type { DetailedPerson } from '@/store/slices/tree/types'

export const AddMemberContentView: React.FC<AddMemberContentViewProps> = ({
  onSelectType,
  addActions,
  t,
}) => {
  return (
    <View
      className="flex flex-col items-center"
      onStartShouldSetResponder={() => true}
    >
      <Text className="text-lg font-heading text-secondary-900 mb-4 px-2 py-2 text-center">
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
              onPress={() => void onSelectType(action.key)}
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
              onPress={() => void onSelectType(action.key)}
              isWide
              isDisabled={action.isDisabled}
            />
          ))}
        </HStack>
      </VStack>
    </View>
  )
}

export const getAddMemberActions = (treeId: string, person: DetailedPerson, t: (key: string) => string): Array<{ key: MemberType } & ActionButtonProps> => {
  const { hasSpouse, isRoot } = useFamilyTree()

  return [
    {
      key: MemberType.PARENTS,
      icon: Users,
      label: t('parents'),
      isDisabled: !isRoot(treeId, person.id),
    },
    {
      key: MemberType.SPOUSE,
      icon: Heart,
      label: t('spouse'),
      isDisabled: hasSpouse(treeId, person.id),
    },
    {
      key: MemberType.SIBLING,
      icon: UsersRound,
      label: t('sibling'),
      isDisabled: !person.isBloodRelated,
    },
    {
      key: MemberType.CHILD,
      icon: Baby,
      label: t('child'),
      isDisabled: false,
    },
  ]
}
