import DateTimePicker from 'react-native-ui-datepicker'
import type { DateType } from 'react-native-ui-datepicker'
import dayjs from 'dayjs'

// Themed classNames for the date picker
const themedClassNames = {
  // Header styles
  header: 'bg-primary-50 rounded-lg mb-4',
  month_selector_label: 'text-primary-900 font-heading',
  year_selector_label: 'text-primary-900 font-heading',
  button_next_image: 'text-primary-900', // tintColor equivalents often need specific handling or just text color if it's an icon font, but for images tintColor is usually style. ui-datepicker uses Image for buttons? Let's check types. Button images are usually icons. If they are images, classNames might not apply tintColor directly via text-color classes in standard Tailwind without nativewind support for tint. However, usually 'text-white' works for SVGs if they use currentColor. Let's try text-background-0.
  button_prev_image: 'text-primary-900',

  // Weekday styles
  weekday_label: 'text-typography-400',

  // Day styles
  days_label: 'font-sans',
  day_label: 'text-typography-900 font-sans',
  today: 'border border-primary-500',
  today_label: 'text-primary-500',

  // Selected day styles
  selected: 'bg-primary-50 rounded-md',
  selected_label: 'text-primary-900 font-heading',

  // Outside days
  outside_label: 'text-typography-400',

  // Disabled days (beyond minDate/maxDate)
  disabled: 'opacity-30',
  disabled_label: 'opacity-30',

  // Month/Year picker styles
  month_label: 'text-typography-900',
  year_label: 'text-typography-900',
  selected_month: 'bg-primary-50 rounded-md',
  selected_month_label: 'text-primary-900 font-heading',
  selected_year: 'bg-primary-50 rounded-md',
  selected_year_label: 'text-primary-900 font-heading',
}

export interface ThemedDatePickerProps {
  /** Currently selected date as timestamp or Date */
  value: Date | number
  /** Callback when date changes */
  onChange: (date: Date) => void
  /** Minimum selectable date */
  minimumDate?: Date
  /** Maximum selectable date */
  maximumDate?: Date
}

/**
 * Themed DatePicker component that uses the app's theme colors.
 * Wraps react-native-ui-datepicker with predefined styling.
 */
export const ThemedDatePicker = ({
  value,
  onChange,
  minimumDate,
  maximumDate,
}: ThemedDatePickerProps) => {
  const dateValue = typeof value === 'number' ? new Date(value) : value

  const handleChange = (params: { date: DateType }) => {
    if (params.date) {
      const newDate = dayjs(params.date).toDate()
      onChange(newDate)
    }
  }

  return (
    <DateTimePicker
      mode="single"
      date={dateValue}
      onChange={handleChange}
      minDate={minimumDate}
      maxDate={maximumDate}
      classNames={themedClassNames}
    />
  )
}

export default ThemedDatePicker
