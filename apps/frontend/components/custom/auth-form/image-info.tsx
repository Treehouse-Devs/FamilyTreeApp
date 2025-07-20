import { Image } from '@/components/ui/image'
import { Text } from '@/components/ui/text'
import { VStack } from '@/components/ui/vstack'
import FormActionButton from './form-action-button'

const ImageInfo = ({ image, text, button }: { image: string, text: string, button?: { text: string, onPress: () => void } }) => {
  return (
    <VStack className="w-full items-center justify-center">
      <Image className="w-full h-[200px] mb-2 rounded-2xl" source={image} resizeMode="cover" alt={text} />
      <Text className="text-md font-semibold text-primary-500">{text}</Text>
      {button && (
        <FormActionButton
          text={button.text}
          onPress={button.onPress}
          isDisabled={false}
          isLoading={false}
        />
      )}
    </VStack>
  )
}

export default ImageInfo
