import { View } from 'react-native'
import { Text } from '@/components/ui/text'
import { VStack } from '@/components/ui/vstack'
import { Radio, RadioGroup, RadioIndicator, RadioIcon, RadioLabel } from '@/components/ui/radio'
import { CircleIcon } from '@/components/ui/icon'
import type { ListItemType } from './types'
import { Button } from '@/components/ui/button'
import { cn } from '@gluestack-ui/utils/nativewind-utils'

export const ListItems = ({ items }: { items: ListItemType[] }) => {
  return (
    <VStack className="w-full">
      {items.map((item, index) => (
        <View key={item.id}>
          <ListItem item={item} />
          {index < items.length - 1 && (
            <View className="h-[1px] bg-secondary-300 mx-4" />
          )}
        </View>
      ))}
    </VStack>
  )
}

export const ListItem = ({ item }: { item: ListItemType }) => {
  const content = (
    <VStack className={cn('w-full', item.radioButtons ? 'py-2 px-4' : '')}>
      {/* Title/Label */}
      <Text className="text-secondary-700 text-sm mb-0.5">{item.title}</Text>

      {/* Description or Radio Buttons */}
      {item.radioButtons
        ? (
            <RadioGroup value={item.radioButtons.selectedId} className="flex-row gap-6">
              {item.radioButtons.selections.map(selection => (
                <Radio
                  key={selection.id}
                  value={selection.id}
                  size="md"
                  onPress={selection.onPress}
                >
                  <RadioIndicator>
                    <RadioIcon as={CircleIcon} />
                  </RadioIndicator>
                  <RadioLabel className="text-secondary-900 text-lg font-medium">{selection.label}</RadioLabel>
                </Radio>
              ))}
            </RadioGroup>
          )
        : (
            <Text className="text-secondary-900 text-lg font-medium">{item.description}</Text>
          )}
    </VStack>
  )

  if (item.onPress) {
    return (
      <Button variant="link" onPress={item.onPress} className="py-2 px-4 rounded-none data-[active=true]:bg-secondary-100 h-fit">
        {content}
      </Button>
    )
  }

  return content
}
