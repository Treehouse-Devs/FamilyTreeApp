// color-tokens.ts
import { useColorScheme } from 'react-native'

// Raw color values for use with Skia and other non-nativewind contexts
// These are the same values as in gluestack config but accessible as plain strings
const rawColors = {
  light: {
    primary: {
      0: '222 244 237',
      50: '192 231 216',
      100: '162 217 195',
      200: '132 203 174',
      300: '102 189 154',
      400: '72 175 134',
      500: '63 162 129',
      600: '52 139 110',
      700: '42 116 92',
      800: '31 93 73',
      900: '21 70 55',
      950: '15 49 38',
    },
    secondary: {
      0: '252 237 231',
      50: '246 220 207',
      100: '240 202 182',
      200: '234 185 158',
      300: '228 167 134',
      400: '222 151 118',
      500: '216 145 110',
      600: '184 123 93',
      700: '151 101 76',
      800: '118 79 59',
      900: '86 57 43',
      950: '54 35 26',
    },
  },
  dark: {
    primary: {
      0: '25 72 55',
      50: '43 87 71',
      100: '62 101 87',
      200: '80 116 103',
      300: '98 131 119',
      400: '117 145 135',
      500: '135 160 151',
      600: '154 174 167',
      700: '172 189 183',
      800: '191 204 199',
      900: '209 218 215',
      950: '227 233 231',
    },
    secondary: {
      0: '20 20 20',
      50: '23 23 23',
      100: '31 31 31',
      200: '39 39 39',
      300: '44 44 44',
      400: '56 57 57',
      500: '63 64 64',
      600: '86 86 86',
      700: '110 110 110',
      800: '135 135 135',
      900: '150 150 150',
      950: '164 164 164',
    },
  },
} as const

export type Mode = 'light' | 'dark'
export type ColorName = 'primary' | 'secondary'
export type ColorValue = '0' | '50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | '950'

/**
 * Get raw color triplet string for use with Skia or other non-nativewind contexts
 */
export const getVar = (mode: Mode, name: ColorName, value: ColorValue): string => {
  return rawColors[mode][name][value]
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
