// color-tokens.ts
import { config } from '@/components/ui/gluestack-ui-provider/config'
import { useColorScheme } from 'react-native' // or use gluestack's useColorMode()

type Mode = keyof typeof config // 'light' | 'dark'

type Name = 'primary' | 'secondary' | 'tertiary' | 'error' | 'success' | 'warning' | 'info' | 'typography' | 'outline' | 'background' | 'indicator'

type Value = '0' | '50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | '950'

export const getVar = (mode: Mode, name: Name, value: Value) => {
  const key = `--color-${name}-${value}`
  return config[mode][key] || config.light[key] || config.dark[key]
}

export const asRgb = (triplet: string) => {
  // "42 116 92" -> "rgb(42,116,92)"
  const [r, g, b] = triplet.split(/\s+/)
  return `rgb(${r},${g},${b})`
}

export const asHex = (triplet: string) => {
  // "42 116 92" -> "#2A745C"
  const toHex = (n: string) => Number(n).toString(16).padStart(2, '0')
  const [r, g, b] = triplet.split(/\s+/)
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase()
}

// Helper to pick current mode
export const useCurrentMode = (): Mode => {
  const scheme = useColorScheme()
  return scheme === 'dark' ? 'dark' : 'light'
}
