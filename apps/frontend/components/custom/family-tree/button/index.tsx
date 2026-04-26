import { Button, ButtonText } from '@/components/ui/button'
import { HStack } from '@/components/ui/hstack'
import { Text } from '@/components/ui/text'
import type { ReactNode } from 'react'
import type { GestureResponderEvent } from 'react-native'

export type TreeScreenButtonProps = {
  onPress?: (e: GestureResponderEvent) => void
  label?: string
  icon?: ReactNode
}

export const TreeScreenButtons = ({ buttons, button, className }: { buttons?: TreeScreenButtonProps[], button?: TreeScreenButtonProps, className?: string }) => {
  return (
    <HStack
      className={`items-center h-[48px] rounded-[12px] bg-secondary-0 border-2 border-secondary-500 shadow-md ${className || ''}`}
      space="sm"
      pointerEvents="auto"
      style={{
        // iOS shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        // Android shadow
        elevation: 8,
      }}
    >
      {button && <TreeScreenButton {...button} />}
      {buttons && buttons?.map((buttonProps, index) => (
        <TreeScreenButton key={index} {...buttonProps} />
      ))}
    </HStack>
  )
}

const TreeScreenButton = (buttonProps: TreeScreenButtonProps) => {
  const { onPress, icon, label } = buttonProps

  return onPress
    ? (
        <Button onPress={onPress} className="rounded-xl w-12 h-12 bg-secondary-0 shadow-md data-[hover=true]:bg-secondary-50 data-[active=true]:bg-secondary-100">
          {icon}
          {label && <ButtonText className="text-secondary-900 font-bold text-sm">{label}</ButtonText>}
        </Button>
      )
    : (
        <HStack className="items-center" space="md">
          {icon}
          <Text className="text-secondary-800 font-bold text-sm">{label}</Text>
        </HStack>
      )
}
