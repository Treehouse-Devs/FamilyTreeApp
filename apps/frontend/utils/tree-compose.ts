import type { Person, Tree } from '@/store/slices/tree/types'
import type { FlatPersonDto, FlatTreeDto } from '@treely/dto'
import { validateFamilyGraph, type TreeIssue } from './tree-validate'

export type FlatPerson = FlatPersonDto
export type FlatTree = FlatTreeDto

export type ComposeResult = {
  tree: Tree
  persons: FlatPerson[]
  roots: Person[]
  issues: TreeIssue[]
}

/**
 * Composes a nested forest from a flat persons array.
 *
 * A family tree is really a forest: several top-level roots (people with no known
 * parents) whose lineages descend independently. This builds every such root, ordering
 * siblings by birthDate, then birthOrder, then insertion order. The declared `rootId`
 * is treated as a "primary" hint only — it may be stale (deleted, or given parents) so
 * we tolerate it and fall back to the first root.
 */
export function composeTreeFromFlat(flatTree: FlatTree): ComposeResult {
  const { id, name, createdAt, updatedAt, familyImageUrl, rootId, persons } = flatTree

  // Lookup + insertion-order index for quick access and stable sorting.
  const personMap = new Map<string, FlatPerson>()
  const personIndex = new Map<string, number>()
  persons.forEach((person, i) => {
    personMap.set(person.id, person)
    personIndex.set(person.id, i)
  })

  const hasParent = (p: FlatPerson) => !!p.fatherId || !!p.motherId

  // Of a couple, which member is the blood/anchor node that owns the subtree; the other
  // renders via the spouse mechanism (so it must not also appear as a top-level root).
  function anchorOfCouple(p: FlatPerson, q: FlatPerson): FlatPerson {
    if (hasParent(p) !== hasParent(q)) return hasParent(p) ? p : q

    return (personIndex.get(p.id) ?? 0) <= (personIndex.get(q.id) ?? 0) ? p : q
  }

  // Resolve a person's partner, tolerating one-sided spouse links.
  function partnerOf(p: FlatPerson): FlatPerson | undefined {
    const partner = (p.spouseId ? personMap.get(p.spouseId) : undefined)
      ?? persons.find(q => q.spouseId === p.id)
    if (!partner) return undefined
    // Only treat as a couple if the link is real in at least one direction.
    if (partner.spouseId !== p.id && p.spouseId !== partner.id) return undefined

    return partner
  }

  // An in-law that only exists as someone else's spouse must not be a top-level root.
  function isNonAnchorSpouse(p: FlatPerson): boolean {
    const partner = partnerOf(p)
    if (!partner) return false

    return anchorOfCouple(p, partner).id !== p.id
  }

  const isTopLevelRoot = (p: FlatPerson) => !hasParent(p) && !isNonAnchorSpouse(p)

  // Sibling ordering: birthDate asc (present before missing), then birthOrder, then
  // insertion order as a stable, deterministic fallback.
  function compareSiblings(a: FlatPerson, b: FlatPerson): number {
    const aHasBd = a.birthDate != null, bHasBd = b.birthDate != null
    if (aHasBd && bHasBd) {
      if (a.birthDate !== b.birthDate) return (a.birthDate as number) - (b.birthDate as number)
    } else if (aHasBd !== bHasBd) {
      return aHasBd ? -1 : 1
    }

    const aHasBo = a.birthOrder != null, bHasBo = b.birthOrder != null
    if (aHasBo && bHasBo) {
      if (a.birthOrder !== b.birthOrder) return (a.birthOrder as number) - (b.birthOrder as number)
    } else if (aHasBo !== bHasBo) {
      return aHasBo ? -1 : 1
    }

    return (personIndex.get(a.id) ?? 0) - (personIndex.get(b.id) ?? 0)
  }

  // Children of a person: anyone referencing them as father or mother.
  function findChildren(personId: string): FlatPerson[] {
    return persons.filter(p => p.fatherId === personId || p.motherId === personId)
  }

  function toPerson(flat: FlatPerson): Person {
    return {
      id: flat.id,
      name: flat.name,
      birthDate: flat.birthDate,
      birthOrder: flat.birthOrder,
      gender: flat.gender,
      deathDate: flat.deathDate,
      spouseId: flat.spouseId,
      imageThumbnailUrl: flat.imageThumbnailUrl,
    }
  }

  // Guards against cycles and diamond (DAG) re-materialization: a person is built into
  // exactly one subtree. validateFamilyGraph reports when this actually drops data.
  const built = new Set<string>()

  function buildPerson(personId: string): Person | undefined {
    const flatPerson = personMap.get(personId)
    if (!flatPerson) return undefined
    if (built.has(personId)) return undefined
    built.add(personId)

    const person: Person = toPerson(flatPerson)

    const children = findChildren(personId).sort(compareSiblings)
    if (children.length > 0) {
      person.children = children
        .map(child => buildPerson(child.id))
        .filter((child): child is Person => child !== undefined)
    }

    // Attach the partner as a (non-recursive) spouse only when this person is the
    // couple's anchor, so the in-law renders exactly once and is kept out of the
    // top-level roots. Works for mutual or one-sided spouse links.
    const partner = partnerOf(flatPerson)
    if (partner && anchorOfCouple(flatPerson, partner).id === flatPerson.id) {
      person.spouse = { ...toPerson(partner), children: [] }
    }

    return person
  }

  const roots = persons
    .filter(isTopLevelRoot)
    .sort(compareSiblings)
    .map(fp => buildPerson(fp.id))
    .filter((p): p is Person => p !== undefined)

  // Primary root for back-compat: prefer the declared rootId when it is a real top-level
  // root, otherwise fall back to the first root (handles deleted / re-parented roots).
  const primary = roots.find(r => r.id === rootId) ?? roots[0]

  const issues = validateFamilyGraph(persons, rootId)

  return {
    persons,
    roots,
    issues,
    tree: {
      id,
      name,
      createdAt,
      updatedAt,
      familyImageUrl,
      root: primary,
      roots,
    },
  }
}
