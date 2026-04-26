import { Button, ButtonIcon } from '@/components/ui/button'
import { HStack } from '@/components/ui/hstack'
import { ChevronLeft } from 'lucide-react-native'
import { Text } from '@/components/ui/text'
import type { ImageSourcePropType } from 'react-native'
import { Image } from 'react-native'
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated'
import { cn } from '@gluestack-ui/utils/nativewind-utils'

interface ActionBarProps {
  title: string
  onBack?: () => void
  thumbnailSource?: ImageSourcePropType | { uri: string }
  showThumbnail?: boolean
  className?: string
  rightIconSlot?: React.ReactNode
}

export const ActionBar = ({ title, onBack, thumbnailSource, showThumbnail = false, className = '', rightIconSlot }: ActionBarProps) => {
  const thumbnailAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(showThumbnail ? 1 : 0, { duration: 150 }),
      transform: [
        {
          translateY: withTiming(showThumbnail ? 0 : -10, { duration: 150 }),
        },
      ],
    }
  })

  const textAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: withTiming(showThumbnail ? 0 : thumbnailSource ? -56 : 0, { duration: 200 }),
        },
      ],
    }
  })

  return (
    <HStack
      className={cn('mt-16 mb-4 px-4 items-center w-full gap-2', className)}
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
      {onBack && (
        <Button onPress={onBack} variant="link" className="p-0 shrink-0">
          <ButtonIcon as={ChevronLeft} className="text-primary-700 w-10 h-10" />
        </Button>
      )}
      {thumbnailSource && (
        <Animated.View
          style={[
            thumbnailAnimatedStyle,
            {
              width: 40,
              height: 40,
              borderRadius: 20,
              overflow: 'hidden',
              marginRight: 8,
            },
          ]}
        >
          <Image
            source={thumbnailSource}
            style={{ width: 40, height: 40 }}
            resizeMode="cover"
          />
        </Animated.View>
      )}
      <Animated.View style={[textAnimatedStyle, { flex: 1 }]}>
        <Text
          className="text-primary-700 font-heading text-2xl"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {title}
        </Text>
      </Animated.View>
      <HStack className="ml-auto">
        {rightIconSlot}
      </HStack>
    </HStack>
  )
}
