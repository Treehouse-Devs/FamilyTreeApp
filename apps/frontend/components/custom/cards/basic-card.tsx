import { cn } from '@gluestack-ui/utils/nativewind-utils'
import { View, StyleProp, ViewStyle } from 'react-native'
import { Text } from '@/components/ui/text'
import { VStack } from '@/components/ui/vstack'
import { Pressable } from '@/components/ui/pressable'

export const BasicCard = ({ children, className, onPress, category, style }: { children: React.ReactNode, className?: string, onPress?: () => void, category?: string, style?: StyleProp<ViewStyle> }) => {
  const cardContent = (
    <VStack className="w-full max-w-md px-1" style={style}>
      {!onPress && category && (
        <Text className="text-primary-700 text-sm mb-2 mr-auto ml-4">{category}</Text>
      )}
      <View className={cn('w-full bg-secondary-0 group-active/card:bg-secondary-100 group-active/card:scale-95 rounded-2xl border-2 border-secondary-500 py-2 items-center flex flex-column', className)}>
        {children}
      </View>
    </VStack>
  )

  if (onPress) {
    return (
      <VStack className="w-full max-w-md px-1" style={style}>
        {category && (
          <Text className="text-primary-700 text-xs mb-2 mr-auto ml-4">{category}</Text>
        )}
        <Pressable onPress={onPress} className="group/card">
          {cardContent}
        </Pressable>
      </VStack>
    )
  }

  return cardContent
}
