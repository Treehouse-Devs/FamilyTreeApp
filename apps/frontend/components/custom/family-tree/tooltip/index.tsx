import React, { useState } from 'react'
import { Modal, Pressable } from 'react-native'
import Animated, { Easing, FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated'
import { useTranslation } from 'react-i18next'

import { getYear, getAge } from '@/utils/date'

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
        <Animated.View
          layout={LinearTransition.duration(150).easing(Easing.ease)}
          className="min-w-fit max-w-[80%] lg:max-w-[60%] xl:max-w-[50%]"
        >
          {currentView === 'main'
            ? (
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
                    <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(100)} className="w-full">
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
