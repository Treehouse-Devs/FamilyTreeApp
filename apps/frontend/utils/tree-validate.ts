import type { FlatPersonDto } from '@treely/dto'

/**
 * Graph-integrity checks over the flat person list, run before/after composing the
 * nested tree. The forest renderer (single virtual super-root over top-level roots)
 * can draw disconnected lineages side by side, but it cannot draw a couple whose two
 * members each have their own ancestry sharing children (a true DAG). These checks
 * surface such cases as errors — "cannot represent this yet" — instead of letting the
 * renderer silently drop or mis-draw people.
 */

export type TreeIssueCode =
  | 'CYCLE'
  | 'DAG_CHILD_COLLISION'
  | 'MULTIPLE_SPOUSES'
  | 'DANGLING_SPOUSE'
  | 'STALE_ROOT'
  | 'MISSING_ROOT'

export type TreeIssue = {
  level: 'error' | 'warning'
  code: TreeIssueCode
  message: string
  personIds: string[]
}

const hasParent = (p: FlatPersonDto) => !!p.fatherId || !!p.motherId

/**
 * Detects cycles in the parent graph (someone who is their own ancestor) via a
 * three-color DFS. Edges point child -> father and child -> mother.
 */
function detectCycles(persons: FlatPersonDto[], byId: Map<string, FlatPersonDto>): string[] {
  const WHITE = 0, GRAY = 1, BLACK = 2
  const color = new Map<string, number>()
  persons.forEach(p => color.set(p.id, WHITE))
  const cycleNodes = new Set<string>()

  const visit = (id: string): boolean => {
    color.set(id, GRAY)
    const p = byId.get(id)
    const parents = [p?.fatherId, p?.motherId].filter(
      (x): x is string => !!x && byId.has(x),
    )
    for (const parent of parents) {
      const c = color.get(parent)
      if (c === GRAY) {
        cycleNodes.add(parent)
        cycleNodes.add(id)

        return true
      }
      if (c === WHITE && visit(parent)) {
        cycleNodes.add(id)

        return true
      }
    }
    color.set(id, BLACK)

    return false
  }

  for (const p of persons) {
    if (color.get(p.id) === WHITE) visit(p.id)
  }

  return Array.from(cycleNodes)
}

export function validateFamilyGraph(persons: FlatPersonDto[], rootId?: string): TreeIssue[] {
  const issues: TreeIssue[] = []
  const byId = new Map<string, FlatPersonDto>()
  for (const p of persons) byId.set(p.id, p)

  // --- CYCLE ---------------------------------------------------------------
  const cycleNodes = detectCycles(persons, byId)
  if (cycleNodes.length > 0) {
    issues.push({
      level: 'error',
      code: 'CYCLE',
      message: 'A parent relationship forms a cycle (a person is their own ancestor).',
      personIds: cycleNodes,
    })

    // Further structural checks assume an acyclic graph; a cycle makes them unreliable.
    return issues
  }

  // --- DAG_CHILD_COLLISION -------------------------------------------------
  // A child whose father AND mother each have their own ancestry means two lineages
  // converge on this couple. The forest layout attaches children under a single anchor,
  // so it cannot draw the second lineage joining in. Report one issue per couple.
  const seenCouples = new Set<string>()
  for (const child of persons) {
    if (!child.fatherId || !child.motherId) continue
    const father = byId.get(child.fatherId)
    const mother = byId.get(child.motherId)
    if (!father || !mother) continue
    if (!hasParent(father) || !hasParent(mother)) continue

    const key = [father.id, mother.id].sort().join('::')
    if (seenCouples.has(key)) continue
    seenCouples.add(key)

    issues.push({
      level: 'error',
      code: 'DAG_CHILD_COLLISION',
      message: 'Both partners of a couple have their own ancestry, which the current '
        + 'forest layout cannot draw (needs generation-based layout).',
      personIds: [father.id, mother.id, child.id],
    })
  }

  // --- MULTIPLE_SPOUSES / DANGLING_SPOUSE ----------------------------------
  const incomingSpouseRefs = new Map<string, string[]>()
  for (const p of persons) {
    if (!p.spouseId) continue
    if (!byId.has(p.spouseId)) {
      issues.push({
        level: 'warning',
        code: 'DANGLING_SPOUSE',
        message: `Spouse link points to a person not in this tree (${p.spouseId}).`,
        personIds: [p.id],
      })
      continue
    }
    const refs = incomingSpouseRefs.get(p.spouseId) ?? []
    refs.push(p.id)
    incomingSpouseRefs.set(p.spouseId, refs)
  }
  for (const [targetId, sourceIds] of incomingSpouseRefs) {
    if (sourceIds.length > 1) {
      issues.push({
        level: 'warning',
        code: 'MULTIPLE_SPOUSES',
        message: 'A person is referenced as the spouse of more than one person '
          + '(the schema supports a single spouse).',
        personIds: [targetId, ...sourceIds],
      })
    }
  }

  // --- STALE_ROOT / MISSING_ROOT -------------------------------------------
  const topLevel = persons.filter(p => !hasParent(p))
  if (persons.length > 0 && topLevel.length === 0) {
    issues.push({
      level: 'warning',
      code: 'MISSING_ROOT',
      message: 'No top-level root found (every person has a parent).',
      personIds: [],
    })
  }
  if (rootId) {
    const declared = byId.get(rootId)
    if (!declared) {
      issues.push({
        level: 'warning',
        code: 'STALE_ROOT',
        message: `The declared rootId (${rootId}) is not a current member; falling back to another root.`,
        personIds: [rootId],
      })
    } else if (hasParent(declared)) {
      issues.push({
        level: 'warning',
        code: 'STALE_ROOT',
        message: `The declared root (${rootId}) now has parents and is no longer a top-level root.`,
        personIds: [rootId],
      })
    }
  }

  return issues
}
