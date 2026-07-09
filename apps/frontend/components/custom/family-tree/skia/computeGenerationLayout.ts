import type { FlatPersonDto } from '@treely/dto'
import type { Person } from '@/store/slices/tree/types'
import type { NodeLayout, Edge, CoupleUnionLayout, TreeLayout } from './types'
import {
  NODE_W,
  NODE_H,
  H_GAP,
  H_GAP_SUBTREE,
  H_GAP_COUPLE,
  V_GAP,
  PADDING_X,
  PADDING_Y,
} from './types'

/**
 * Generation/level-based family-tree layout.
 *
 * Works from the *flat* graph (fatherId/motherId/spouseId) — the complete DAG — rather than
 * the lossy nested tree, so it can draw a couple whose two partners each have their own
 * ancestry, joined at the marriage. The layout atom is a "couple union" (1–2 people sharing a
 * generation, children hanging below their midpoint).
 *
 * Phases: build unions -> assign generations (condensed longest path) -> order within each
 * generation (seed DFS) -> assign x (pack + iterative centering) -> emit nodes/edges/unions.
 */

type PersonId = string
type UnionId = string

interface CoupleUnion {
  id: UnionId
  members: PersonId[] // 1 or 2; ordered [left, right] once x is assigned
  anchorId: PersonId
  childIds: PersonId[] // children of this union, sibling-sorted
  gen: number
  order: number // index within its generation
  center: number // horizontal center
}

// --- Small helpers (mirror the logic in utils/tree-compose.ts) ----------------

const hasParent = (p: FlatPersonDto) => !!p.fatherId || !!p.motherId

function makeComparator(personIndex: Map<PersonId, number>) {
  return function compareSiblings(a: FlatPersonDto, b: FlatPersonDto): number {
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
}

function flatToPerson(f: FlatPersonDto): Person {
  return {
    id: f.id,
    name: f.name,
    birthDate: f.birthDate,
    birthOrder: f.birthOrder,
    isBloodRelated: f.isBloodRelated,
    gender: f.gender,
    deathDate: f.deathDate,
    spouseId: f.spouseId,
    imageThumbnailUrl: f.imageThumbnailUrl,
  }
}

// --- Union construction -------------------------------------------------------

interface UnionModel {
  unions: Map<UnionId, CoupleUnion>
  unionOf: Map<PersonId, UnionId> // person -> their marriage union
  parentUnionsOf: Map<UnionId, UnionId[]> // union -> unions it descends from (0..2)
  childUnionsOf: Map<UnionId, UnionId[]> // union -> child unions
}

function buildUnions(
  persons: FlatPersonDto[],
  byId: Map<PersonId, FlatPersonDto>,
  personIndex: Map<PersonId, number>,
  compareSiblings: (a: FlatPersonDto, b: FlatPersonDto) => number,
): UnionModel {
  const anchorOfCouple = (p: FlatPersonDto, q: FlatPersonDto): FlatPersonDto => {
    if (hasParent(p) !== hasParent(q)) return hasParent(p) ? p : q
    if (p.isBloodRelated !== q.isBloodRelated) return p.isBloodRelated ? p : q

    return (personIndex.get(p.id) ?? 0) <= (personIndex.get(q.id) ?? 0) ? p : q
  }

  const partnerOf = (p: FlatPersonDto): FlatPersonDto | undefined => {
    const partner = (p.spouseId ? byId.get(p.spouseId) : undefined)
      ?? persons.find(q => q.spouseId === p.id)
    if (!partner) return undefined
    if (partner.spouseId !== p.id && p.spouseId !== partner.id) return undefined

    return partner
  }

  const unions = new Map<UnionId, CoupleUnion>()
  const unionOf = new Map<PersonId, UnionId>()

  for (const p of persons) {
    if (unionOf.has(p.id)) continue
    const partner = partnerOf(p)

    if (partner && !unionOf.has(partner.id)) {
      const anchor = anchorOfCouple(p, partner)
      const other = anchor.id === p.id ? partner : p
      const id = `u:${[p.id, partner.id].sort().join('|')}`
      unions.set(id, {
        id, members: [anchor.id, other.id], anchorId: anchor.id,
        childIds: [], gen: 0, order: 0, center: 0,
      })
      unionOf.set(p.id, id)
      unionOf.set(partner.id, id)
    } else if (!partner) {
      const id = `u:${p.id}`
      unions.set(id, {
        id, members: [p.id], anchorId: p.id,
        childIds: [], gen: 0, order: 0, center: 0,
      })
      unionOf.set(p.id, id)
    }
  }

  // Children -> parent union (prefer father's union; fall back to mother's).
  for (const p of persons) {
    if (!hasParent(p)) continue
    const parentUnionId = (p.fatherId ? unionOf.get(p.fatherId) : undefined)
      ?? (p.motherId ? unionOf.get(p.motherId) : undefined)
    if (!parentUnionId) continue
    unions.get(parentUnionId)!.childIds.push(p.id)
  }

  // Sort children within each union.
  for (const u of unions.values()) {
    u.childIds.sort((a, b) => compareSiblings(byId.get(a)!, byId.get(b)!))
  }

  // Condensed union edges (parent union -> child's marriage union).
  const parentUnionsOf = new Map<UnionId, UnionId[]>()
  const childUnionsOf = new Map<UnionId, UnionId[]>()
  for (const u of unions.values()) {
    for (const childId of u.childIds) {
      const childUnion = unionOf.get(childId)!
      if (childUnion === u.id) continue
      const parents = parentUnionsOf.get(childUnion) ?? []
      if (!parents.includes(u.id)) parents.push(u.id)
      parentUnionsOf.set(childUnion, parents)
      const children = childUnionsOf.get(u.id) ?? []
      if (!children.includes(childUnion)) children.push(childUnion)
      childUnionsOf.set(u.id, children)
    }
  }

  return { unions, unionOf, parentUnionsOf, childUnionsOf }
}

// --- Generations: condensed longest path (Kahn) -------------------------------

function assignGenerations(model: UnionModel): void {
  const { unions, parentUnionsOf, childUnionsOf } = model
  const indegree = new Map<UnionId, number>()
  for (const u of unions.values()) {
    indegree.set(u.id, (parentUnionsOf.get(u.id) ?? []).length)
    u.gen = 0
  }

  const queue: UnionId[] = []
  for (const u of unions.values()) {
    if ((indegree.get(u.id) ?? 0) === 0) queue.push(u.id)
  }

  let processed = 0
  while (queue.length > 0) {
    const uId = queue.shift()!
    processed++
    const uGen = unions.get(uId)!.gen
    for (const v of childUnionsOf.get(uId) ?? []) {
      const vu = unions.get(v)!
      if (uGen + 1 > vu.gen) vu.gen = uGen + 1
      indegree.set(v, (indegree.get(v) ?? 0) - 1)
      if ((indegree.get(v) ?? 0) === 0) queue.push(v)
    }
  }

  // If a cycle left some unions unprocessed (data error; normally guarded upstream),
  // they keep gen 0 so we still render something instead of crashing.
  void processed
}

// --- Ordering within generations: seed DFS ------------------------------------

function orderWithinGenerations(
  model: UnionModel,
  byId: Map<PersonId, FlatPersonDto>,
  compareSiblings: (a: FlatPersonDto, b: FlatPersonDto) => number,
): Map<number, CoupleUnion[]> {
  const { unions, parentUnionsOf, childUnionsOf } = model
  const seq = new Map<UnionId, number>()
  let counter = 0

  const roots = [...unions.values()]
    .filter(u => (parentUnionsOf.get(u.id) ?? []).length === 0)
    .sort((a, b) => compareSiblings(byId.get(a.anchorId)!, byId.get(b.anchorId)!))

  const visit = (uId: UnionId) => {
    if (seq.has(uId)) return
    seq.set(uId, counter++)
    for (const child of childUnionsOf.get(uId) ?? []) visit(child)
  }
  for (const r of roots) visit(r.id)
  // Any union unreached by a root (e.g. inside a cycle) still gets a sequence.
  for (const u of unions.values()) visit(u.id)

  const byGen = new Map<number, CoupleUnion[]>()
  for (const u of unions.values()) {
    const list = byGen.get(u.gen) ?? []
    list.push(u)
    byGen.set(u.gen, list)
  }
  for (const [gen, list] of byGen) {
    list.sort((a, b) => (seq.get(a.id) ?? 0) - (seq.get(b.id) ?? 0))
    list.forEach((u, i) => {
      u.order = i
    })
    byGen.set(gen, list)
  }

  return byGen
}

// --- X assignment: pack + iterative centering ---------------------------------

const unionWidth = (u: CoupleUnion) => (u.members.length === 2 ? 2 * NODE_W + H_GAP_COUPLE : NODE_W)
const unionHalf = (u: CoupleUnion) => unionWidth(u) / 2

function assignX(model: UnionModel, byGen: Map<number, CoupleUnion[]>, iterations = 8): void {
  const { unions, parentUnionsOf, childUnionsOf } = model
  const gens = [...byGen.keys()].sort((a, b) => a - b)

  const shareParent = (a: CoupleUnion, b: CoupleUnion): boolean => {
    const pa = parentUnionsOf.get(a.id) ?? []
    const pb = parentUnionsOf.get(b.id) ?? []

    return pa.some(x => pb.includes(x))
  }

  const gapBetween = (a: CoupleUnion, b: CoupleUnion) => (shareParent(a, b) ? H_GAP : H_GAP_SUBTREE)

  // Phase A — pack each generation left to right.
  for (const gen of gens) {
    const row = byGen.get(gen)!
    let cursor = PADDING_X
    row.forEach((u, i) => {
      if (i > 0) cursor += gapBetween(row[i - 1], u)
      u.center = cursor + unionHalf(u)
      cursor += unionWidth(u)
    })
  }

  const mean = (ids: UnionId[]) =>
    ids.reduce((s, id) => s + unions.get(id)!.center, 0) / ids.length

  const resolveOverlaps = (row: CoupleUnion[]) => {
    for (let i = 1; i < row.length; i++) {
      const min = row[i - 1].center + unionHalf(row[i - 1]) + gapBetween(row[i - 1], row[i]) + unionHalf(row[i])
      if (row[i].center < min) row[i].center = min
    }
  }

  // Phase B — alternate pulling parents over children and children under parents.
  for (let iter = 0; iter < iterations; iter++) {
    // Parents over children (process bottom-up so children are already placed).
    for (let g = gens.length - 1; g >= 0; g--) {
      const row = byGen.get(gens[g])!
      for (const u of row) {
        const kids = childUnionsOf.get(u.id) ?? []
        if (kids.length > 0) u.center = mean(kids)
      }
      resolveOverlaps([...row].sort((a, b) => a.order - b.order))
    }
    // Children under parents (process top-down so parents are already placed).
    for (let g = 0; g < gens.length; g++) {
      const row = byGen.get(gens[g])!
      for (const u of row) {
        const parents = parentUnionsOf.get(u.id) ?? []
        if (parents.length > 0) u.center = mean(parents)
      }
      resolveOverlaps([...row].sort((a, b) => a.order - b.order))
    }
  }

  // Normalize so the left-most node starts at PADDING_X.
  let minCenterLeft = Infinity
  for (const u of unions.values()) minCenterLeft = Math.min(minCenterLeft, u.center - unionHalf(u))
  const shift = PADDING_X - minCenterLeft
  if (Number.isFinite(shift) && shift !== 0) {
    for (const u of unions.values()) u.center += shift
  }
}

// --- Emit TreeLayout ----------------------------------------------------------

export function computeGenerationLayout(persons: FlatPersonDto[]): TreeLayout {
  const byId = new Map<PersonId, FlatPersonDto>()
  const personIndex = new Map<PersonId, number>()
  persons.forEach((p, i) => {
    byId.set(p.id, p)
    personIndex.set(p.id, i)
  })

  const compareSiblings = makeComparator(personIndex)
  const model = buildUnions(persons, byId, personIndex, compareSiblings)
  assignGenerations(model)
  const byGen = orderWithinGenerations(model, byId, compareSiblings)
  assignX(model, byGen)

  const nodes: NodeLayout[] = []
  const edges: Edge[] = []
  const unionLayouts: CoupleUnionLayout[] = []

  for (const u of model.unions.values()) {
    const y = u.gen * (NODE_H + V_GAP) + PADDING_Y
    const [leftId, rightId] = u.members
    const width = unionWidth(u)
    const leftX = u.center - width / 2

    // member nodes
    const leftPerson = byId.get(leftId)
    if (leftPerson) nodes.push({ id: leftId, person: flatToPerson(leftPerson), depth: u.gen, x: leftX, y })
    if (rightId) {
      const rightPerson = byId.get(rightId)
      const rightX = leftX + NODE_W + H_GAP_COUPLE
      if (rightPerson) nodes.push({ id: rightId, person: flatToPerson(rightPerson), depth: u.gen, x: rightX, y })
      edges.push({ fromId: leftId, toId: rightId, type: 'couple' })
    }

    unionLayouts.push({ id: u.id, memberIds: u.members, midX: u.center, topY: y, bottomY: y + NODE_H })

    for (const childId of u.childIds) {
      edges.push({ fromId: u.id, toId: childId, type: 'parent-child', fromUnionId: u.id })
    }
  }

  let minX = Infinity, minY = Infinity, maxX = 0, maxY = 0
  for (const node of nodes) {
    minX = Math.min(minX, node.x)
    minY = Math.min(minY, node.y)
    maxX = Math.max(maxX, node.x + NODE_W)
    maxY = Math.max(maxY, node.y + NODE_H)
  }
  if (!Number.isFinite(minX)) {
    minX = 0
    minY = 0
  }

  return {
    nodes,
    edges,
    unions: unionLayouts,
    canvasWidth: maxX + PADDING_X,
    canvasHeight: maxY + PADDING_Y,
    contentMinX: minX,
    contentMinY: minY,
    contentMaxX: maxX,
    contentMaxY: maxY,
  }
}
