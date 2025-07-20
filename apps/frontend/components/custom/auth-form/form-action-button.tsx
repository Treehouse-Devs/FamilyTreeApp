import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button'

const FormActionButton = ({ text, onPress, isDisabled, isLoading }: { text: string, onPress: () => void, isDisabled?: boolean, isLoading?: boolean }) => {
  return (
    <Button onPress={onPress} isDisabled={isDisabled} className="mt-6 w-fit py-2 px-6 mx-auto rounded-md">
      <ButtonText>{text}</ButtonText>
      {isLoading && <ButtonSpinner className="ms-2" />}
    </Button>
  )
}

export default FormActionButton
