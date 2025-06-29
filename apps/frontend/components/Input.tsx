import { TextInput, Text, View, StyleSheet } from 'react-native'

// TODO: Just for testing purposes, adjust the UI as needed
type InputProps = {
  label: string
  value?: string
  onChangeText: (text: string) => void
  error?: string
  secureTextEntry?: boolean
  placeholder?: string
}

export const Input = ({
  label,
  value,
  onChangeText,
  error,
  secureTextEntry = false,
  placeholder,
}: InputProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        placeholder={placeholder}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontWeight: '600', marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 12,
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
})
