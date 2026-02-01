import React from 'react'
import { View } from 'react-native'
import { Trash } from 'lucide-react-native'

import { Text } from '@/components/ui/text'
import { HStack } from '@/components/ui/hstack'
import { VStack } from '@/components/ui/vstack'
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button'
import { Person } from '@/store/slices/treeSlice'
import { useFamilyTree } from '@/hooks/useFamilyTree'

import { RemovePersonContentViewProps } from './types'
import { sharedViewClassName } from './base'

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
      className={sharedViewClassName + ' max-w-[80%]'}
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
          <ButtonIcon className="text-white" as={Trash} />
          <ButtonText>
            {t('remove')}
          </ButtonText>
        </Button>
      </HStack>
    </View>
  )
}
