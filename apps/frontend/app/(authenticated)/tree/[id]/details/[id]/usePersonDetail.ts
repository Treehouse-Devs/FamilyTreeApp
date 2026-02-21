import { useEffect, useState } from 'react'
import { useFamilyTree } from '@/hooks/useFamilyTree'
import { TreeService } from '@/services/treeService'
import { DetailedPerson } from '@/store/slices/treeSlice'
import { Category } from '.'

export const usePersonDetail = (id: string, selectedTreeId: string) => {
  const { getPerson, setPerson } = useFamilyTree()

  const [personDetail, setPersonDetail] = useState<DetailedPerson | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPerson = async () => {
      const person = getPerson(selectedTreeId, id)
      if (person && (person.location || person.occupation || person.contact)) {
        setPersonDetail(person)
      } else {
        const treePerson = getPerson(selectedTreeId, id)
        const { person: fetchedPerson } = await TreeService.fetchPersonById(selectedTreeId, id)
        // Merge fetched data with tree person to preserve gender and other tree fields
        const mergedPerson = { ...fetchedPerson, gender: treePerson?.gender }
        setPersonDetail(mergedPerson)
        setPerson(selectedTreeId, id, mergedPerson)
      }
      setIsLoading(false)
    }
    void fetchPerson()
  }, [selectedTreeId])

  const sendUpdate = async (prop: string, category: Category | undefined, value: string | number) => {
    if (personDetail) {
      try {
        let editedPersonDetail: DetailedPerson

        if (category) {
          // Nested property (location, contact, occupation)
          editedPersonDetail = {
            ...personDetail,
            [category]: {
              ...personDetail[category],
              [prop]: value,
            },
          }
        } else {
          // Top-level property (name, gender, birthDate, etc.)
          if (prop === 'isStillAliveQ') {
            // change deathDate to undefined if value is stillAlive and to today date if set to notAlive
            editedPersonDetail = {
              ...personDetail,
              deathDate: value === 'stillAlive' ? undefined : new Date().getTime(),
            }
          } else {
            editedPersonDetail = {
              ...personDetail,
              [prop]: value,
            }
          }
        }

        setPersonDetail(editedPersonDetail)
        setPerson(selectedTreeId, id, editedPersonDetail)
        await TreeService.patchPersonById(selectedTreeId, id, editedPersonDetail)
      } catch (error) {
        console.error('Patch API error:', error)
      }
    }
  }

  return {
    personDetail,
    setPersonDetail,
    isLoading,
    sendUpdate,
  }
}
