import { View } from 'react-native'
import { Text } from '@/components/ui/text'
import { VStack } from '@/components/ui/vstack'
import { Radio, RadioGroup, RadioIndicator, RadioIcon, RadioLabel } from '@/components/ui/radio'
import { CircleIcon } from '@/components/ui/icon'
import type { ListItemType } from './types'
import { Button } from '@/components/ui/button'

export const ListItems = ({ items }: { items: ListItemType[] }) => {
  return (
    <VStack className="w-full px-2">
      {items.map((item, index) => (
        <View key={item.id}>
          <ListItem item={item} />
          {index < items.length - 1 && (
            <View className="h-[1px] bg-secondary-300 mx-2" />
          )}
        </View>
      ))}
    </VStack>
  )
}

export const ListItem = ({ item }: { item: ListItemType }) => {
  const wrapperClassName = 'w-full px-2 rounded-md'

  const content = (
    <VStack className={`${item.onPress ? '' : 'py-2'} w-full`}>
      {/* Title/Label */}
      <Text className={`${item.onPress ? '' : 'px-2'} text-secondary-700 text-sm mb-0.5`}>{item.title}</Text>

      {/* Description or Radio Buttons */}
      {item.radioButtons
        ? (
            <RadioGroup value={item.radioButtons.selectedId} className={`flex-row mt-1 gap-6 ${wrapperClassName}`}>
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
                  <RadioLabel className="text-secondary-900 text-lg font-sans">{selection.label}</RadioLabel>
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
      <Button variant="link" onPress={item.onPress} className={`${wrapperClassName} py-2 data-[active=true]:bg-secondary-100/50 h-fit`}>
        {content}
      </Button>
    )
  }

  return content
}
