import React, { useState } from 'react'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { useTranslation } from 'react-i18next'

import { getYear, getAge } from '@/utils/date'
import { Modal } from '@/components/custom/modals/modal'

import { ContentView, MemberType, PersonTooltipProps } from './types'
import { MainContentView } from './main'
import { AddMemberContentView } from './add-member'
import { RemovePersonContentView } from './remove-person'

// Re-export types for external use
export type { MemberType, PersonTooltipProps } from './types'
export { RemovePersonContentView } from './remove-person'

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
              person={person}
              treeId={treeId}
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
