import { Capacitor } from '@capacitor/core'
import { useBreakpoints } from '@vueuse/core'

/**
 * The single source of truth for the mobile/desktop split.
 *
 * `md` is Tailwind's default 768px breakpoint, so `isDesktop` here and a `md:`
 * utility in a template always agree.
 */
export const breakpoints = useBreakpoints({ md: 768, lg: 1024 })

export function usePlatform() {
  const isNative = Capacitor.isNativePlatform()
  const platform = Capacitor.getPlatform()

  const isDesktop = breakpoints.greaterOrEqual('md')

  return {
    /** Running inside the Capacitor shell rather than a browser tab. */
    isNative,
    platform,
    /** Viewport is desktop-width. Independent of `isNative` — a tablet can be both. */
    isDesktop,
  }
}
