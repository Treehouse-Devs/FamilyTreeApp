import type { DetailedPerson } from '@/store/slices/tree/types'
import { useFamilyTree } from '@/hooks/useFamilyTree'
import { TreeService } from '@/services/treeService'
import { Gender } from '@treely/dto'
import type { CreateFamilyMemberDto } from '@treely/dto'
import { useTranslation } from 'react-i18next'

export const useAddMember = (treeId: string) => {
  const { addPerson, getParentsIds, getPersonFromRoot } = useFamilyTree()
  const { t } = useTranslation()

  const createAndAddPerson = async (
    dtoOverrides: Partial<CreateFamilyMemberDto>,
    relationshipType: 'parent' | 'children' | 'spouse',
    targetId: string | undefined,
    logContext: string,
    fromPerson?: DetailedPerson,
  ) => {
    if (!targetId) {
      throw new Error(`Failed to create person: Invalid target person ID for ${logContext}`)
    }

    try {
      const dto: CreateFamilyMemberDto = {
        ...blankPerson(t),
        ...dtoOverrides,
      }
      const { person } = await TreeService.createPerson(treeId, dto)

      if (relationshipType === 'spouse') {
        await TreeService.patchPersonById(treeId, targetId, {
          spouseId: person.id,
        })
      } else if (relationshipType === 'parent') {
        await TreeService.patchPersonById(treeId, targetId, {
          ...(dto.gender === Gender.MALE
            ? { fatherId: person.id }
            : { motherId: person.id }),
          isBloodRelated: true,
        })

        if (fromPerson && (fromPerson.spouseId || fromPerson.spouse?.id)) {
          await TreeService.patchPersonById(treeId, fromPerson.spouseId || fromPerson.spouse?.id || '', {
            isBloodRelated: false,
          })
        }
      }

      if (person) {
        addPerson(treeId, person, relationshipType, targetId)

        return person.id
      } else {
        throw new Error('Failed to create person')
      }
    } catch (error) {
      console.error(`[useAddMember] Error ${logContext}:`, error)
      throw error
    }
  }

  const addChild = (fromPerson: DetailedPerson) => {
    if (!fromPerson.isBloodRelated && (fromPerson.spouseId || fromPerson.spouse?.id)) {
      const spouse = getPersonFromRoot(treeId, fromPerson.spouseId || fromPerson.spouse?.id || '')

      if (!spouse) {
        throw new Error('Failed to add child: Invalid spouse person')
      }

      fromPerson = spouse
    }

    return createAndAddPerson(
      {
        fatherId: fromPerson.gender === Gender.MALE ? fromPerson.id : undefined,
        motherId: fromPerson.gender === Gender.FEMALE ? fromPerson.id : undefined,
      },
      'children',
      fromPerson.id,
      'adding child',
    )
  }

  const addSpouse = (fromPerson: DetailedPerson) =>
    createAndAddPerson(
      {
        spouseId: fromPerson.id,
        isBloodRelated: false,
      },
      'spouse',
      fromPerson.id,
      'adding spouse',
    )

  const addSiblings = (fromPerson: DetailedPerson) => {
    const { fatherId, motherId } = getParentsIds(treeId, fromPerson.id)

    return createAndAddPerson(
      {
        fatherId: fatherId ?? undefined,
        motherId: motherId ?? undefined,
      },
      'children',
      fatherId ?? motherId ?? undefined,
      'adding sibling',
    )
  }

  const addParents = (fromPerson: DetailedPerson) =>
    createAndAddPerson(
      {},
      'parent',
      fromPerson.id,
      'adding parents',
      fromPerson,
    )

  return { addChild, addSpouse, addSiblings, addParents }
}

const blankPerson = (t: (key: string) => string): CreateFamilyMemberDto => {
  return {
    name: t('newMember'),
    gender: Gender.MALE,
    birthDate: Date.now(),
    deathDate: undefined,
    isBloodRelated: true,
    spouseId: undefined,
    fatherId: undefined,
    motherId: undefined,
  }
}
