import { useEffect, useState } from 'react'
import { useFamilyTree } from '@/hooks/useFamilyTree'
import { TreeService } from '@/services/treeService'
import type { DetailedPerson } from '@/store/slices/tree/types'
import type { Category } from '.'

export const usePersonDetail = (id: string, selectedTreeId: string) => {
  const { getPersonDetails, setPersonDetails } = useFamilyTree()

  const [details, setDetails] = useState<DetailedPerson | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPerson = async () => {
      const person = getPersonDetails(selectedTreeId, id) as DetailedPerson
      if (person && (person.location || person.occupation || person.contact)) {
        setDetails(person)
      } else {
        const { person: fetchedPerson } = await TreeService.fetchPersonById(selectedTreeId, id)
        setDetails(fetchedPerson)
      }
      setIsLoading(false)
    }
    void fetchPerson()
  }, [selectedTreeId])

  const sendUpdate = async (prop: string, category: Category | undefined, value: string | number) => {
    if (details) {
      try {
        let editedPersonDetail: DetailedPerson

        if (category) {
          // Nested property (location, contact, occupation)
          editedPersonDetail = {
            ...details,
            [category]: {
              ...details[category],
              [prop]: value,
            },
          }
        } else {
          // Top-level property (name, gender, birthDate, etc.)
          if (prop === 'isStillAliveQ') {
            // change deathDate to undefined if value is stillAlive and to today date if set to notAlive
            editedPersonDetail = {
              ...details,
              deathDate: value === 'stillAlive' ? undefined : new Date().getTime(),
            }
          } else {
            editedPersonDetail = {
              ...details,
              [prop]: value,
            }
          }
        }

        setDetails(editedPersonDetail)
        setPersonDetails(selectedTreeId, id, editedPersonDetail)
        await TreeService.patchPersonById(selectedTreeId, id, editedPersonDetail)
      } catch (error) {
        console.error('Patch API error:', error)
      }
    }
  }

  return {
    personDetail: details,
    setPersonDetail: setDetails,
    isLoading,
    sendUpdate,
  }
}
