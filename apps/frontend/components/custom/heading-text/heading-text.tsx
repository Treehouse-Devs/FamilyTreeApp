import { Text } from '@/components/ui/text'

const HeadingText = ({ text }: { text: string }) => {
  return (
    <Text className="font-heading text-2xl text-primary-500 mb-4 mx-4">{text}</Text>
  )
}

export default HeadingText
