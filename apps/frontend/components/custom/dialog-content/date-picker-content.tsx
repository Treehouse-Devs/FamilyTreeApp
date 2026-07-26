import { ThemedDatePicker } from '@/components/custom/date-picker'
import { VStack } from '@/components/ui/vstack'

export const DatePickerContent = ({
  selectedDate,
  setSelectedDate,
}: {
  selectedDate: Date
  setSelectedDate: (date: Date) => void
}) => {
  const handleDateChange = (date: Date) => {
    setSelectedDate(date)
  }

  return (
    <VStack className="w-full items-center" space="lg">
      <ThemedDatePicker
        value={selectedDate}
        onChange={handleDateChange}
      />
    </VStack>
  )
}
