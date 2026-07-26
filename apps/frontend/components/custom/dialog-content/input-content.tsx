import { Input, InputField } from '@/components/ui/input'
import { VStack } from '@/components/ui/vstack'
import { FormControl, FormControlError, FormControlErrorText } from '@/components/ui/form-control'

export const InputContent = ({
  inputValue,
  setInputValue,
  placeholder,
  keyboardType,
  isInvalid,
  errorMessage,
  type,
}: {
  inputValue: string
  setInputValue: (value: string) => void
  placeholder?: string
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad'
  isInvalid?: boolean
  errorMessage?: string
  type?: 'text' | 'password'
}) => {
  return (
    <FormControl className="w-full px-4" size="md" isInvalid={isInvalid}>
      <VStack className="w-full items-center" space="sm">
        <Input isInvalid={isInvalid}>
          <InputField
            value={inputValue}
            onChangeText={setInputValue}
            placeholder={placeholder}
            keyboardType={keyboardType}
            type={type}
          />
        </Input>
        {isInvalid && errorMessage
          ? (
              <FormControlError className="self-start">
                <FormControlErrorText>{errorMessage}</FormControlErrorText>
              </FormControlError>
            )
          : null}
      </VStack>
    </FormControl>
  )
}
