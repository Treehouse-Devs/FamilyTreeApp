import { computeGenerationLayout } from '../computeGenerationLayout'
import { NODE_W, NODE_H, H_GAP_COUPLE, V_GAP, PADDING_Y } from '../types'
import type { FlatPersonDto } from '@treely/dto'
import type { TreeLayout } from '../types'

const p = (over: Partial<FlatPersonDto> & { id: string }): FlatPersonDto => ({
  name: over.id,
  gender: 'male' as FlatPersonDto['gender'],
  ...over,
})

const node = (l: TreeLayout, id: string) => l.nodes.find(n => n.id === id)!
const unionOfMember = (l: TreeLayout, id: string) => l.unions.find(u => u.memberIds.includes(id))!
const yFor = (gen: number) => gen * (NODE_H + V_GAP) + PADDING_Y

const noOverlaps = (l: TreeLayout) => {
  for (let i = 0; i < l.nodes.length; i++) {
    for (let j = i + 1; j < l.nodes.length; j++) {
      const a = l.nodes[i], b = l.nodes[j]
      if (a.depth === b.depth && Math.abs(a.x - b.x) < NODE_W - 0.001) {
        return `${a.id} and ${b.id} overlap at depth ${a.depth}`
      }
    }
  }

  return null
}

describe('computeGenerationLayout — converging lineages (the DAG case)', () => {
  // BF-BM and GF-GM are two grandparent couples; B (child of BF/BM) marries G (child of
  // GF/GM); C is their child. Both ancestries must sit above the B-G couple.
  const persons: FlatPersonDto[] = [
    p({ id: 'BF', spouseId: 'BM' }),
    p({ id: 'BM', spouseId: 'BF' }),
    p({ id: 'GF', spouseId: 'GM' }),
    p({ id: 'GM', spouseId: 'GF' }),
    p({ id: 'B', fatherId: 'BF', motherId: 'BM', spouseId: 'G' }),
    p({ id: 'G', fatherId: 'GF', motherId: 'GM', spouseId: 'B' }),
    p({ id: 'C', fatherId: 'B', motherId: 'G' }),
  ]
  const layout = computeGenerationLayout(persons)

  it('assigns correct generations', () => {
    for (const id of ['BF', 'BM', 'GF', 'GM']) expect(node(layout, id).depth).toBe(0)
    expect(node(layout, 'B').depth).toBe(1)
    expect(node(layout, 'G').depth).toBe(1)
    expect(node(layout, 'C').depth).toBe(2)
  })

  it('positions each generation at the right y', () => {
    expect(node(layout, 'BF').y).toBe(yFor(0))
    expect(node(layout, 'B').y).toBe(yFor(1))
    expect(node(layout, 'C').y).toBe(yFor(2))
  })

  it('draws each couple as two adjacent cards sharing a row', () => {
    for (const [a, b] of [['BF', 'BM'], ['GF', 'GM'], ['B', 'G']]) {
      const na = node(layout, a), nb = node(layout, b)
      expect(na.y).toBe(nb.y)
      expect(Math.abs(na.x - nb.x)).toBeCloseTo(NODE_W + H_GAP_COUPLE, 3)
    }
  })

  it('places both ancestries flanking the couple', () => {
    const bg = unionOfMember(layout, 'B').midX
    const bfbm = unionOfMember(layout, 'BF').midX
    const gfgm = unionOfMember(layout, 'GF').midX
    expect(Math.min(bfbm, gfgm)).toBeLessThan(bg)
    expect(Math.max(bfbm, gfgm)).toBeGreaterThan(bg)
  })

  it('centers the child under the couple midpoint', () => {
    const bg = unionOfMember(layout, 'B').midX
    const c = unionOfMember(layout, 'C').midX
    expect(c).toBeCloseTo(bg, 1)
  })

  it('produces no overlapping nodes in any generation', () => {
    expect(noOverlaps(layout)).toBeNull()
  })

  it('emits parent-child edges from the correct parent union', () => {
    const bfbm = unionOfMember(layout, 'BF').id
    const gfgm = unionOfMember(layout, 'GF').id
    const bg = unionOfMember(layout, 'B').id
    const pc = layout.edges.filter(e => e.type === 'parent-child')
    expect(pc).toContainEqual({ fromId: bfbm, toId: 'B', type: 'parent-child', fromUnionId: bfbm })
    expect(pc).toContainEqual({ fromId: gfgm, toId: 'G', type: 'parent-child', fromUnionId: gfgm })
    expect(pc).toContainEqual({ fromId: bg, toId: 'C', type: 'parent-child', fromUnionId: bg })
  })

  it('emits a couple edge for each pair', () => {
    const couples = layout.edges.filter(e => e.type === 'couple')
    const has = (a: string, b: string) =>
      couples.some(e => (e.fromId === a && e.toId === b) || (e.fromId === b && e.toId === a))
    expect(has('BF', 'BM')).toBe(true)
    expect(has('GF', 'GM')).toBe(true)
    expect(has('B', 'G')).toBe(true)
  })

  it('reports canvas bounds enclosing every node', () => {
    for (const n of layout.nodes) {
      expect(n.x).toBeGreaterThanOrEqual(layout.contentMinX)
      expect(n.x + NODE_W).toBeLessThanOrEqual(layout.contentMaxX)
    }
    expect(layout.canvasWidth).toBeGreaterThan(0)
    expect(layout.canvasHeight).toBeGreaterThan(0)
  })
})

describe('computeGenerationLayout — other cases', () => {
  it('handles a single lineage', () => {
    const layout = computeGenerationLayout([
      p({ id: 'A', spouseId: 'B' }),
      p({ id: 'B', spouseId: 'A' }),
      p({ id: 'C', fatherId: 'A', motherId: 'B' }),
    ])
    expect(node(layout, 'A').depth).toBe(0)
    expect(node(layout, 'C').depth).toBe(1)
    expect(noOverlaps(layout)).toBeNull()
  })

  it('lays out a disconnected forest at the same top row', () => {
    const layout = computeGenerationLayout([
      p({ id: 'A' }), p({ id: 'AC', fatherId: 'A' }),
      p({ id: 'X' }), p({ id: 'XC', fatherId: 'X' }),
    ])
    expect(node(layout, 'A').depth).toBe(0)
    expect(node(layout, 'X').depth).toBe(0)
    expect(node(layout, 'AC').depth).toBe(1)
    expect(noOverlaps(layout)).toBeNull()
  })

  it('places an in-law with no ancestry beside the blood partner (no upward edge)', () => {
    const layout = computeGenerationLayout([
      p({ id: 'B', spouseId: 'M' }),
      p({ id: 'M', spouseId: 'B' }),
      p({ id: 'C', fatherId: 'B', motherId: 'M' }),
    ])
    expect(node(layout, 'B').depth).toBe(0)
    expect(node(layout, 'M').depth).toBe(0)
    // No parent-child edge points at a root (B or M).
    const pc = layout.edges.filter(e => e.type === 'parent-child')
    expect(pc.some(e => e.toId === 'B' || e.toId === 'M')).toBe(false)
  })

  it('handles a child with a single known parent', () => {
    const layout = computeGenerationLayout([
      p({ id: 'A' }),
      p({ id: 'C', fatherId: 'A' }),
    ])
    expect(node(layout, 'A').depth).toBe(0)
    expect(node(layout, 'C').depth).toBe(1)
  })

  it('re-roots when parents are added to one spouse (asymmetric ancestry)', () => {
    // B (root) married G; then G gains parents GF/GM. B stays at G's generation.
    const layout = computeGenerationLayout([
      p({ id: 'B', spouseId: 'G' }),
      p({ id: 'G', spouseId: 'B', fatherId: 'GF', motherId: 'GM' }),
      p({ id: 'C', fatherId: 'B', motherId: 'G' }),
      p({ id: 'GF', spouseId: 'GM' }),
      p({ id: 'GM', spouseId: 'GF' }),
    ])
    expect(node(layout, 'GF').depth).toBe(0)
    expect(node(layout, 'B').depth).toBe(1)
    expect(node(layout, 'G').depth).toBe(1)
    expect(node(layout, 'C').depth).toBe(2)
    // The couple is centered under its single parent union.
    expect(unionOfMember(layout, 'B').midX).toBeCloseTo(unionOfMember(layout, 'GF').midX, 1)
    expect(noOverlaps(layout)).toBeNull()
  })
})
