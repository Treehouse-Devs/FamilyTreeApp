import { cn } from '@gluestack-ui/utils/nativewind-utils'
import { View, Pressable } from 'react-native'
import { Text } from '@/components/ui/text'
import { VStack } from '@/components/ui/vstack'

export const BasicCard = ({ children, className, onPress, category }: { children: React.ReactNode, className?: string, onPress?: () => void, category?: string }) => {
  const cardContent = (
    <VStack className="w-full max-w-md px-1">
      {!onPress && category && (
        <Text className="text-primary-700 text-sm mb-2 mr-auto ml-4">{category}</Text>
      )}
      <View className={cn('w-full bg-secondary-0 data-[active=true]:bg-secondary-100 rounded-2xl border-2 border-secondary-500 py-2 items-center flex flex-column', className)}>
        {children}
      </View>
    </VStack>
  )

  if (onPress) {
    return (
      <VStack className="w-full max-w-md px-1">
        {category && (
          <Text className="text-primary-700 text-xs mb-2 mr-auto ml-4">{category}</Text>
        )}
        <Pressable onPress={onPress}>
          {cardContent}
        </Pressable>
      </VStack>
    )
  }

  return cardContent
}
