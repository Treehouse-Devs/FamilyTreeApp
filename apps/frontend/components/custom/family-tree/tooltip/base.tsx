import React from 'react'

import { Text } from '@/components/ui/text'
import { Button, ButtonIcon } from '@/components/ui/button'
import { ActionButtonProps } from './types'

export const sharedViewClassName = 'bg-secondary-0 rounded-2xl border-2 border-secondary-500 px-[0.75rem] py-[0.625rem] items-center shadow-lg elevation-lg'

export const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  label,
  onPress,
  isDestructive,
  isWide,
  isDisabled,
}) => {
  const activeColor = isDestructive ? 'data-[active=true]:bg-error-500' : 'data-[active=true]:bg-primary-50'
  const buttonWidth = isWide ? 'w-[90px]' : 'w-[60px]'
  const disabledOpacity = isDisabled ? '/50' : ''

  return (
    <Button
      variant="link"
      action={isDestructive ? 'negative' : 'default'}
      onPress={onPress}
      disabled={isDisabled}
      className={`flex flex-col items-center justify-center ${buttonWidth} h-[60px] p-0 rounded-md ${activeColor}`}
    >
      <ButtonIcon as={icon} size="lg" className={`${isDestructive ? `text-error-500${disabledOpacity}` : `text-primary-700${disabledOpacity}`}`} />
      <Text className={`text-sm font-medium ${isDestructive ? `text-error-500${disabledOpacity}` : `text-primary-700${disabledOpacity}`}`}>
        {label}
      </Text>
    </Button>
  )
}
