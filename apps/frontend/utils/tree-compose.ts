import type { Person, Tree } from '@/store/slices/tree/types'
import type { FlatPersonDto, FlatTreeDto } from '@treely/dto'

export type FlatPerson = FlatPersonDto
export type FlatTree = FlatTreeDto

/**
 * Composes a nested tree structure from a flat persons array.
 * Converts FlatTree (with rootId and persons array) to Tree (with nested root Person).
 */
export function composeTreeFromFlat(flatTree: FlatTree): { tree: Tree, persons: FlatPerson[] } {
  const { id, name, createdAt, updatedAt, familyImageUrl, rootId, persons } = flatTree

  // Create a map for quick person lookup
  const personMap = new Map<string, FlatPerson>()
  for (const person of persons) {
    personMap.set(person.id, person)
  }

  // Find children of a person by looking for persons that reference them as father or mother
  function findChildrenIds(personId: string): string[] {
    const childrenIds: string[] = []
    for (const person of persons) {
      if (person.fatherId === personId || person.motherId === personId) {
        childrenIds.push(person.id)
      }
    }

    return childrenIds
  }

  // Recursively build a nested Person from a flat person
  function buildPerson(personId: string): Person | undefined {
    const flatPerson = personMap.get(personId)
    if (!flatPerson) return undefined

    const person: Person = {
      id: flatPerson.id,
      name: flatPerson.name,
      birthDate: flatPerson.birthDate,
      isBloodRelated: flatPerson.isBloodRelated,
      gender: flatPerson.gender,
      deathDate: flatPerson.deathDate,
      spouseId: flatPerson.spouseId,
      imageThumbnailUrl: flatPerson.imageThumbnailUrl,
    }

    // Build children recursively by finding persons that reference this person as parent
    const childrenIds = findChildrenIds(personId)
    if (childrenIds.length > 0) {
      person.children = childrenIds
        .map(childId => buildPerson(childId))
        .filter((child): child is Person => child !== undefined)
    }

    // Build spouse (non-recursive to avoid circular references)
    if (flatPerson.spouseId) {
      const spouseFlat = personMap.get(flatPerson.spouseId)
      if (spouseFlat) {
        person.spouse = {
          id: spouseFlat.id,
          name: spouseFlat.name,
          birthDate: spouseFlat.birthDate,
          isBloodRelated: spouseFlat.isBloodRelated,
          gender: spouseFlat.gender,
          deathDate: spouseFlat.deathDate,
          spouseId: spouseFlat.spouseId,
          imageThumbnailUrl: spouseFlat.imageThumbnailUrl,
          children: [], // Spouse children are not nested to avoid duplication
        }
      }
    }

    return person
  }

  // Build the root person
  const root = buildPerson(rootId)

  return {
    persons,
    tree: {
      id,
      name,
      createdAt,
      updatedAt,
      familyImageUrl,
      root,
    },
  }
}
