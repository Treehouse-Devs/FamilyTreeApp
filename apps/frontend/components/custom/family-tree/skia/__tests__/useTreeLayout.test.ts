// Run the hook's useMemo body synchronously, outside React. The layout math is pure;
// only useEdgePaths touches Skia, which the jest config stubs.
jest.mock('react', () => ({
  useMemo: (fn: () => unknown) => fn(),
}))

import { useTreeLayout } from '../useTreeLayout'
import { NODE_W, PADDING_Y, VIRTUAL_ROOT_ID } from '../types'
import type { Person } from '@/store/slices/tree/types'

const person = (over: Partial<Person> & { id: string }): Person => ({
  name: over.id,
  isBloodRelated: true,
  gender: 'male' as Person['gender'],
  ...over,
})

describe('useTreeLayout — virtual super-root', () => {
  it('lays out multiple roots as a forest without emitting the synthetic node', () => {
    const rootA = person({ id: 'A', children: [person({ id: 'AC' })] })
    const rootB = person({ id: 'B', children: [person({ id: 'BC' })] })

    const { nodes, edges } = useTreeLayout([rootA, rootB])

    // The synthetic super-root is never drawn.
    expect(nodes.find(n => n.id === VIRTUAL_ROOT_ID)).toBeUndefined()
    // ...and it emits no edges to the real roots.
    expect(edges.some(e => e.fromId === VIRTUAL_ROOT_ID)).toBe(false)

    const a = nodes.find(n => n.id === 'A')!
    const b = nodes.find(n => n.id === 'B')!
    expect(a).toBeDefined()
    expect(b).toBeDefined()

    // Both real roots sit at the top row (depth 0).
    expect(a.depth).toBe(0)
    expect(b.depth).toBe(0)
    expect(a.y).toBe(PADDING_Y)
    expect(b.y).toBe(PADDING_Y)

    // Roots are placed side by side, non-overlapping.
    expect(b.x).toBeGreaterThanOrEqual(a.x + NODE_W)
  })

  it('still emits parent-child edges within each root subtree', () => {
    const rootA = person({ id: 'A', children: [person({ id: 'AC' })] })

    const { edges } = useTreeLayout([rootA])
    expect(edges).toContainEqual({ fromId: 'A', toId: 'AC', type: 'parent-child' })
  })

  it('is back-compatible with a single (non-array) root', () => {
    const root = person({ id: 'R', children: [person({ id: 'C' })] })

    const { nodes } = useTreeLayout(root)
    const r = nodes.find(n => n.id === 'R')!
    expect(r).toBeDefined()
    expect(r.depth).toBe(0)
    expect(r.y).toBe(PADDING_Y)
    expect(nodes.find(n => n.id === 'C')?.depth).toBe(1)
    expect(nodes.find(n => n.id === VIRTUAL_ROOT_ID)).toBeUndefined()
  })

  it('emits a spouse node and a couple edge for a root couple', () => {
    const root = person({ id: 'A', spouse: person({ id: 'B', isBloodRelated: false }) })

    const { nodes, edges } = useTreeLayout([root])
    const spouseNode = nodes.find(n => n.id === 'B')
    expect(spouseNode?.isSpouse).toBe(true)
    expect(spouseNode?.bloodRelatedId).toBe('A')
    expect(edges).toContainEqual({ fromId: 'A', toId: 'B', type: 'couple' })
  })

  it('places two roots at the same depth even if their subtrees differ in height', () => {
    const shallow = person({ id: 'S' })
    const deep = person({
      id: 'D',
      children: [person({ id: 'D1', children: [person({ id: 'D2' })] })],
    })

    const { nodes } = useTreeLayout([shallow, deep])
    expect(nodes.find(n => n.id === 'S')!.y).toBe(PADDING_Y)
    expect(nodes.find(n => n.id === 'D')!.y).toBe(PADDING_Y)
  })
})
