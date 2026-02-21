import { View, Image, ActivityIndicator, ImageSourcePropType } from 'react-native'
import { VStack } from '@/components/ui/vstack'
import Modal from '@/components/custom/modals/modal'

interface ImageEditModalProps {
  visible: boolean
  imageSource: ImageSourcePropType
  isUploading: boolean
  onChangePhoto: () => void
  onClose: () => void
  t: (key: string) => string
}

export const ImageEditModal: React.FC<ImageEditModalProps> = ({
  visible,
  imageSource,
  isUploading,
  onChangePhoto,
  onClose,
  t,
}) => {
  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={t('changePhoto')}
      button={{
        text: isUploading ? t('uploading') : t('change'),
        onPress: onChangePhoto,
        isDisabled: isUploading,
      }}
    >
      <VStack className="items-center w-full" space="lg">
        {/* Image Preview */}
        <View className="w-full min-w-64 h-auto aspect-square rounded-lg bg-secondary-100 overflow-hidden relative shadow-md elevation-md">
          <Image
            source={imageSource}
            className="w-full h-full"
            resizeMode="cover"
          />
          {isUploading && (
            <View className="absolute inset-0 bg-secondary-900/50 justify-center items-center">
              <ActivityIndicator size="large" color="#ffffff" />
            </View>
          )}
        </View>
      </VStack>
    </Modal>
  )
}
