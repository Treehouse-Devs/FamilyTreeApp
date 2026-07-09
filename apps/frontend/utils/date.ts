import type { TFunction } from 'i18next'

/** Placeholder shown when a date is unknown (birthDate is now optional). */
export const UNKNOWN_DATE = '—'

/**
 * Get the year from a timestamp, or a placeholder when the date is unknown.
 */
export const getYear = (timestamp: number | undefined): string => {
  if (timestamp == null) return UNKNOWN_DATE

  return new Date(timestamp).getFullYear().toString()
}

/**
 * Calculate the age from birth date to death date (or current date if alive).
 * Returns null when the birth date is unknown.
 */
export const getAge = (birthDate: number | undefined, deathDate: number | undefined): number | null => {
  if (birthDate == null) return null
  const birthYear = new Date(birthDate).getFullYear()
  if (deathDate) {
    return new Date(deathDate).getFullYear() - birthYear
  }

  return new Date().getFullYear() - birthYear
}

/**
 * Calculate age or death info
 */

export const getAgeInfo = (birthDate: number | undefined, deathDate: number | undefined, t: TFunction): string => {
  if (deathDate) {
    const deathYear = getYear(deathDate)

    return t('deceased', { year: deathYear })
  }

  const age = getAge(birthDate, deathDate)
  if (age == null) return UNKNOWN_DATE

  return t('age', { years: age })
}
