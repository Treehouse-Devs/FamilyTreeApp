import { clsx } from 'clsx'
import type { ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Standard shadcn-vue class combiner: conditional classes, last-write-wins merging. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
