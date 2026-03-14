import { Image } from '@/components/ui/image'
import { VStack } from '@/components/ui/vstack'
import noTreeImage from '@/assets/images/empty-family.webp'
import { Text } from '@/components/ui/text'
import { useTranslation } from 'react-i18next'
import { Button, ButtonText } from '@/components/ui/button'

type NoTreeProps = {
  createNewTree: () => void
}

export const NoTree = ({ createNewTree }: NoTreeProps) => {
  const { t } = useTranslation()

  return (
    <VStack className="h-full w-full items-center justify-center pb-60">
      <Image
        source={noTreeImage}
        className="h-60 w-60 mb-5"
      />
      <Text className="font-heading text-base text-primary-900 mb-2">{t('noTreeYet')}</Text>
      <Text className="font-body text-sm text-primary-800 mb-7">{t('noTreeYetDescription')}</Text>
      <Button onPress={createNewTree} action="secondary" variant="solid">
        <ButtonText>{t('create')}</ButtonText>
      </Button>
    </VStack>
  )
}
