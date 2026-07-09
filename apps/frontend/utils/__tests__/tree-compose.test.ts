import { composeTreeFromFlat, type FlatTree, type FlatPerson } from '../tree-compose'

const p = (over: Partial<FlatPerson> & { id: string }): FlatPerson => ({
  name: over.id,
  isBloodRelated: true,
  gender: 'male' as FlatPerson['gender'],
  ...over,
})

const tree = (rootId: string, persons: FlatPerson[]): FlatTree => ({
  id: 't', name: 'T', createdAt: 0, updatedAt: 0, rootId, persons,
})

describe('composeTreeFromFlat', () => {
  it('builds every disconnected top-level root into the forest', () => {
    const persons = [
      p({ id: 'A', birthDate: 100 }),
      p({ id: 'AC', fatherId: 'A' }),
      p({ id: 'X', birthDate: 50 }),
      p({ id: 'XC', fatherId: 'X' }),
    ]
    const { roots } = composeTreeFromFlat(tree('A', persons))
    expect(roots.map(r => r.id).sort()).toEqual(['A', 'X'])
  })

  it('excludes an in-law spouse (mutual link) from roots but attaches them', () => {
    const persons = [
      p({ id: 'A', birthDate: 1, spouseId: 'B' }),
      p({ id: 'B', isBloodRelated: false, spouseId: 'A' }),
    ]
    const { roots } = composeTreeFromFlat(tree('A', persons))
    expect(roots.map(r => r.id)).toEqual(['A'])
    expect(roots[0].spouse?.id).toBe('B')
  })

  it('keeps a one-sided in-law spouse attached and out of the roots', () => {
    // Only the in-law points back; the anchor has no spouseId.
    const persons = [
      p({ id: 'A', birthDate: 1 }),
      p({ id: 'B', isBloodRelated: false, spouseId: 'A' }),
    ]
    const { roots } = composeTreeFromFlat(tree('A', persons))
    expect(roots.map(r => r.id)).toEqual(['A'])
    expect(roots[0].spouse?.id).toBe('B')
  })

  it('keeps exactly one anchor for a mutual no-parent couple', () => {
    const persons = [
      p({ id: 'A', birthDate: 1, spouseId: 'B' }),
      p({ id: 'B', birthDate: 2, spouseId: 'A' }),
    ]
    const { roots } = composeTreeFromFlat(tree('A', persons))
    expect(roots).toHaveLength(1)
    expect(roots[0].id).toBe('A')
    expect(roots[0].spouse?.id).toBe('B')
  })

  it('orders siblings by birthDate, then birthOrder, then insertion order', () => {
    const persons = [
      p({ id: 'A' }),
      // inserted out of order on purpose
      p({ id: 'S2', birthDate: 2000, fatherId: 'A' }),
      p({ id: 'S3', birthOrder: 5, fatherId: 'A' }), // no birthDate -> after dated
      p({ id: 'S1', birthDate: 1990, fatherId: 'A' }),
    ]
    const { roots } = composeTreeFromFlat(tree('A', persons))
    expect(roots[0].children?.map(c => c.id)).toEqual(['S1', 'S2', 'S3'])
  })

  it('uses birthOrder to break ties when birthDate is absent', () => {
    const persons = [
      p({ id: 'A' }),
      p({ id: 'Y', birthOrder: 2, fatherId: 'A' }),
      p({ id: 'X', birthOrder: 1, fatherId: 'A' }),
    ]
    const { roots } = composeTreeFromFlat(tree('A', persons))
    expect(roots[0].children?.map(c => c.id)).toEqual(['X', 'Y'])
  })

  it('carries birthOrder through onto composed nodes', () => {
    const persons = [
      p({ id: 'A' }),
      p({ id: 'C', birthOrder: 3, fatherId: 'A' }),
    ]
    const { roots } = composeTreeFromFlat(tree('A', persons))
    expect(roots[0].children?.[0].birthOrder).toBe(3)
  })

  it('sets the primary root to the declared rootId when valid', () => {
    const persons = [
      p({ id: 'A', birthDate: 100 }),
      p({ id: 'X', birthDate: 50 }),
    ]
    const { tree: t } = composeTreeFromFlat(tree('X', persons))
    expect(t.root?.id).toBe('X')
    expect(t.roots?.map(r => r.id).sort()).toEqual(['A', 'X'])
  })

  it('falls back to the first root when rootId is stale/deleted', () => {
    const persons = [
      p({ id: 'R', birthDate: 1 }),
      p({ id: 'RC', fatherId: 'R' }),
    ]
    const { tree: t, roots } = composeTreeFromFlat(tree('DELETED', persons))
    expect(roots.map(r => r.id)).toEqual(['R'])
    expect(t.root?.id).toBe('R')
  })

  it('renders new parents as roots when the declared root gained parents', () => {
    const persons = [
      p({ id: 'F' }),
      p({ id: 'M', isBloodRelated: false, spouseId: 'F' }),
      p({ id: 'R', fatherId: 'F', motherId: 'M' }), // former root, now has parents
    ]
    const { roots, tree: t } = composeTreeFromFlat(tree('R', persons))
    expect(roots.map(r => r.id)).toEqual(['F']) // M is a non-anchor spouse
    expect(roots[0].spouse?.id).toBe('M')
    expect(roots[0].children?.map(c => c.id)).toEqual(['R'])
    expect(t.root?.id).toBe('F')
  })

  it('does not infinite-loop on a parent cycle and reports it', () => {
    const persons = [
      p({ id: 'A', fatherId: 'B' }),
      p({ id: 'B', fatherId: 'A' }),
    ]
    const result = composeTreeFromFlat(tree('A', persons))
    expect(result.issues.some(i => i.code === 'CYCLE')).toBe(true)
  })

  it('materializes a shared (diamond) descendant only once', () => {
    const persons = [
      p({ id: 'A' }),
      p({ id: 'B' }),
      // C is a child of both roots A and B; must appear under exactly one.
      p({ id: 'C', fatherId: 'A', motherId: 'B' }),
    ]
    const { roots } = composeTreeFromFlat(tree('A', persons))
    const appearances = roots.reduce(
      (n, r) => n + (r.children?.filter(c => c.id === 'C').length ?? 0),
      0,
    )
    expect(appearances).toBe(1)
  })
})
