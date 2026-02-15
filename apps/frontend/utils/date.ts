import { TFunction } from 'i18next'

/**
 * Get the year from a timestamp
 */
export const getYear = (timestamp: number): string => {
  return new Date(timestamp).getFullYear().toString()
}

/**
 * Calculate the age from birth date to death date (or current date if alive)
 */
export const getAge = (birthDate: number, deathDate: number | undefined): number => {
  const birthYear = new Date(birthDate).getFullYear()
  if (deathDate) {
    return new Date(deathDate).getFullYear() - birthYear
  }

  return new Date().getFullYear() - birthYear
}

/**
 * Calculate age or death info
 */

export const getAgeInfo = (birthDate: number, deathDate: number | undefined, t: TFunction): string => {
  const age = getAge(birthDate, deathDate)

  if (deathDate) {
    const deathYear = getYear(deathDate)

    return t('deceased', { year: deathYear })
  }

  return t('age', { years: age })
}
