import type { DetailedPerson } from '@/store/slices/tree/types'
import { useFamilyTree } from '@/hooks/useFamilyTree'
import { TreeService } from '@/services/treeService'
import { Gender } from '@treely/dto'
import type { CreateFamilyMemberDto } from '@treely/dto'
import { useTranslation } from 'react-i18next'

export const useAddMember = (treeId: string) => {
  const { addPerson, getParentsIds } = useFamilyTree()
  const { t } = useTranslation()

  const createAndAddPerson = async (
    dtoOverrides: Partial<CreateFamilyMemberDto>,
    relationshipType: 'parent' | 'children' | 'spouse',
    targetId: string | undefined,
    logContext: string,
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
        })
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

  // Children hang off the couple union, so a child added from either partner renders under the
  // couple — no need to redirect to a particular "blood" side.
  const addChild = (fromPerson: DetailedPerson) =>
    createAndAddPerson(
      {
        fatherId: fromPerson.gender === Gender.MALE ? fromPerson.id : undefined,
        motherId: fromPerson.gender === Gender.FEMALE ? fromPerson.id : undefined,
      },
      'children',
      fromPerson.id,
      'adding child',
    )

  const addSpouse = (fromPerson: DetailedPerson) =>
    createAndAddPerson(
      {
        spouseId: fromPerson.id,
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
    )

  return { addChild, addSpouse, addSiblings, addParents }
}

const blankPerson = (t: (key: string) => string): CreateFamilyMemberDto => {
  return {
    name: t('newMember'),
    gender: Gender.MALE,
    birthDate: Date.now(),
    deathDate: undefined,
    spouseId: undefined,
    fatherId: undefined,
    motherId: undefined,
  }
}
