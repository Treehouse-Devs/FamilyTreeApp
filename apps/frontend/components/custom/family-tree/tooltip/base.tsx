import React from 'react'

import { Text } from '@/components/ui/text'
import { Button, ButtonIcon } from '@/components/ui/button'
import type { ActionButtonProps } from './types'

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
