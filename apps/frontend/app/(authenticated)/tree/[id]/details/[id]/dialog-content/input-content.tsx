import { Input, InputField } from '@/components/ui/input'
import { VStack } from '@/components/ui/vstack'

export const InputContent = ({
  inputValue,
  setInputValue,
  placeholder,
  keyboardType,
}: {
  inputValue: string
  setInputValue: (value: string) => void
  placeholder?: string
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad'
}) => {
  return (
    <VStack className="w-full items-center px-4" space="lg">
      <Input>
        <InputField
          value={inputValue}
          onChangeText={setInputValue}
          placeholder={placeholder}
          keyboardType={keyboardType}
        />
      </Input>
    </VStack>
  )
}
