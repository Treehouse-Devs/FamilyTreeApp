import { Input as GluestackInput } from '@/components/ui/input'

const FormInput = ({ children, isError }: { children: React.ReactNode, isError: boolean }) => {
  return (
    <GluestackInput className={`w-full d-flex max-w-80 rounded-md ${isError ? 'border-red-500' : 'border-primary-50'}`}>
      {children}
    </GluestackInput>
  )
}

export default FormInput
