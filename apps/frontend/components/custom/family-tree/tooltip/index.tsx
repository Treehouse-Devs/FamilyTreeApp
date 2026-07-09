import React, { useState } from 'react'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { useTranslation } from 'react-i18next'

import { getYear, getAge, UNKNOWN_DATE } from '@/utils/date'
import { Modal } from '@/components/custom/modals/modal'

import type { ContentView, MemberType, PersonTooltipProps } from './types'
import { MainContentView } from './main'
import { AddMemberContentView, getAddMemberActions } from './add-member'
import { RemovePersonContentView } from './remove-person'

// Re-export types for external use
export type { PersonTooltipProps } from './types'
export { MemberType } from './types'

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

  const addActions = getAddMemberActions(treeId, person, t)

  const year = getYear(person.birthDate)
  const age = getAge(person.birthDate, person.deathDate)
  const ageText = person.deathDate
    ? t('deceased', { year: getYear(person.deathDate) })
    : age != null ? t('age', { years: age }) : UNKNOWN_DATE

  const handleClose = () => {
    onClose()
  }

  const handleAddPress = () => {
    setCurrentView('addMember')
  }

  const handleSelectMemberType = async (type: MemberType) => {
    await onAddMember?.(type)
    handleClose()
  }

  const handleRemovePress = () => {
    setCurrentView('removeMember')
  }

  const renderContent = () => {
    switch (currentView) {
      case 'main':
        return (
          <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(100)}>
            <MainContentView
              treeId={treeId}
              person={person}
              year={year}
              ageText={ageText}
              onAddPress={handleAddPress}
              isAddMemberDisabled={addActions.every(action => action.isDisabled)}
              onDetailsPress={() => {
                onViewDetails?.()
                handleClose()
              }}
              onDeletePress={handleRemovePress}
              t={t}
            />
          </Animated.View>
        )
      case 'addMember':
        return (
          <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(100)}>
            <AddMemberContentView
              onSelectType={handleSelectMemberType}
              addActions={addActions}
              t={t}
            />
          </Animated.View>
        )
      case 'removeMember':
        return (
          <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(100)} className="w-full">
            <RemovePersonContentView
              person={person}
              treeId={treeId}
              onClose={onClose}
              t={t}
            />
          </Animated.View>
        )
      default:
        return null
    }
  }

  return (
    <Modal visible={visible} onClose={handleClose}>
      {renderContent()}
    </Modal>
  )
}
