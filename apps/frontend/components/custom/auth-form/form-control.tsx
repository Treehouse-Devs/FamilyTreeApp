import { FormControl as GluestackFormControl } from '@/components/ui/form-control'

const FormControl = ({ children }: { children: React.ReactNode }) => {
  return (
    <GluestackFormControl className="d-flex w-full flex-column p-4 border rounded-xl border-primary-50 bg-white">
      {children}
    </GluestackFormControl>
  )
}

export default FormControl
