import React from 'react'
import { View } from 'react-native'
import { Trash } from 'lucide-react-native'

import { Text } from '@/components/ui/text'
import { HStack } from '@/components/ui/hstack'
import { VStack } from '@/components/ui/vstack'
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button'
import type { Person } from '@/store/slices/tree/types'
import { useFamilyTree } from '@/hooks/useFamilyTree'

import type { RemovePersonContentViewProps } from './types'
import { TreeService } from '@/services/treeService'

export const RemovePersonContentView: React.FC<RemovePersonContentViewProps> = ({
  person,
  treeId,
  onClose,
  t,
}) => {
  const { collectAllDependents, removePersonAndAllDependents } = useFamilyTree()
  const dependents = collectAllDependents(treeId, person.id).filter((dependent: Person) => dependent.id !== person.id)

  // call remove person API
  const removePerson = async () => {
    try {
      await TreeService.deletePersonById(treeId, person.id)
      removePersonAndAllDependents(treeId, person.id)
    } catch (error) {
      console.error(error)
    } finally {
      onClose()
    }
  }

  return (
    <View
      className="flex flex-col items-center w-full"
      onStartShouldSetResponder={() => true}
    >
      <Text className="text-lg font-heading text-secondary-900 px-2 py-2 text-center">
        {t('confirmRemove')}
      </Text>
      <Text className="text-base font-body text-secondary-700 mb-2 px-2 text-center">
        {dependents.length > 0 ? t('confirmRemoveDescriptionWithDependents') : t('confirmRemoveDescription')}
      </Text>
      <VStack space="sm" className="w-fit px-4 mb-4 mx-auto pl-[-8px]">
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
          onPress={void removePerson()}
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
