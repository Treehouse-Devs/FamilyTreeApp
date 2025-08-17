import { Button, ButtonText } from '@/components/ui/button'
import { HStack } from '@/components/ui/hstack'
import { Text } from '@/components/ui/text'
import { ReactNode } from 'react'
import { GestureResponderEvent } from 'react-native'

export type TreeScreenButtonProps = {
  onPress?: (e: GestureResponderEvent) => void
  label?: string
  icon?: ReactNode
}

export const TreeScreenButtons = ({ buttons, button, className }: { buttons?: TreeScreenButtonProps[], button?: TreeScreenButtonProps, className?: string }) => {
  return (
    <HStack className={`items-center h-[48px] rounded-[12px] p-1 bg-secondary-0 border-2 border-secondary-500 ${className || ''}`}>
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
        <Button onPress={onPress} className="h-full w-full">
          {icon}
          {label && <ButtonText className="text-secondary-900 font-bold text-sm">{label}</ButtonText>}
        </Button>
      )
    : (
        <HStack className="items-center h-full w-full">
          {icon}
          <Text className="text-secondary-900 font-bold text-sm">{label}</Text>
        </HStack>
      )
}
