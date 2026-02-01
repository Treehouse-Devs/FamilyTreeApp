import { Button, ButtonIcon } from '@/components/ui/button'
import { HStack } from '@/components/ui/hstack'
import { ChevronLeft } from 'lucide-react-native'
import { Text } from '@/components/ui/text'

export const ActionBar = ({ title, onBack }: { title: string, onBack: () => void }) => {
  return (
    <HStack
      className="mt-16 mb-4 px-4 items-center w-full gap-2"
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
      <Button onPress={onBack} variant="link" className="p-0 shrink-0">
        <ButtonIcon as={ChevronLeft} className="text-primary-700 w-10 h-10" />
      </Button>
      <Text
        className="text-primary-700 font-heading text-2xl flex-1"
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {title}
      </Text>
    </HStack>
  )
}
