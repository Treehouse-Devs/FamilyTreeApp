import { describe, expect, it } from 'vitest'
import { Gender } from '@treely/dto/client'
import type { Person } from '@/types/tree'
import { computeTreeLayout, toFlowGraph } from './useTreeLayout'
import {
  H_GAP_COUPLE,
  JUNCTION_PREFIX,
  NODE_H,
  NODE_W,
  PADDING_X,
  PADDING_Y,
  V_GAP,
  junctionId,
} from './types'

/**
 * Layout-parity tests for the Skia -> Vue Flow port.
 *
 * `computeTreeLayout` is a line-for-line port of the RN app's `useTreeLayout`, so
 * these assert the geometric invariants that function has always produced. If the
 * port had drifted — different constants, a changed centring rule — these fail.
 */

const person = (id: string, extra: Partial<Person> = {}): Person => ({
  id,
  name: id,
  birthDate: 0,
  isBloodRelated: true,
  gender: Gender.MALE,
  ...extra,
})

describe('computeTreeLayout', () => {
  it('places a lone root at the padding origin', () => {
    const layout = computeTreeLayout(person('root'))

    expect(layout.nodes).toHaveLength(1)
    expect(layout.nodes[0]).toMatchObject({ id: 'root', depth: 0, x: PADDING_X, y: PADDING_Y })
    expect(layout.edges).toEqual([])
  })

  it('puts a spouse one node width plus the couple gap to the right, on the same row', () => {
    const layout = computeTreeLayout(person('a', { spouse: person('b') }))

    const a = layout.nodes.find(n => n.id === 'a')!
    const b = layout.nodes.find(n => n.id === 'b')!

    expect(b.x - a.x).toBe(NODE_W + H_GAP_COUPLE)
    expect(b.y).toBe(a.y)
    expect(b.isSpouse).toBe(true)
    expect(b.bloodRelatedId).toBe('a')
    expect(layout.edges).toContainEqual({ fromId: 'a', toId: 'b', type: 'couple' })
  })

  it('separates generations by NODE_H + V_GAP', () => {
    const layout = computeTreeLayout(
      person('parent', { children: [person('child')] }),
    )

    const parent = layout.nodes.find(n => n.id === 'parent')!
    const child = layout.nodes.find(n => n.id === 'child')!

    expect(child.depth).toBe(1)
    expect(child.y - parent.y).toBe(NODE_H + V_GAP)
    expect(layout.edges).toContainEqual({ fromId: 'parent', toId: 'child', type: 'parent-child' })
  })

  it('centres a parent over the span of its children', () => {
    const layout = computeTreeLayout(
      person('parent', { children: [person('c1'), person('c2'), person('c3')] }),
    )

    const parent = layout.nodes.find(n => n.id === 'parent')!
    const first = layout.nodes.find(n => n.id === 'c1')!
    const last = layout.nodes.find(n => n.id === 'c3')!

    const parentCentre = parent.x + NODE_W / 2
    const childrenCentre = ((first.x + NODE_W / 2) + (last.x + NODE_W / 2)) / 2

    expect(parentCentre).toBeCloseTo(childrenCentre, 6)
  })

  it('never overlaps siblings, including ones with their own subtrees', () => {
    const layout = computeTreeLayout(person('root', {
      children: [
        person('c1', { spouse: person('c1s'), children: [person('g1'), person('g2')] }),
        person('c2', { children: [person('g3')] }),
      ],
    }))

    const byDepth = new Map<number, typeof layout.nodes>()
    for (const node of layout.nodes) {
      byDepth.set(node.depth, [...(byDepth.get(node.depth) ?? []), node])
    }

    for (const row of byDepth.values()) {
      const sorted = [...row].sort((a, b) => a.x - b.x)
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i].x).toBeGreaterThanOrEqual(sorted[i - 1].x + NODE_W)
      }
    }
  })

  it('reports bounds that contain every node', () => {
    const layout = computeTreeLayout(person('root', {
      spouse: person('spouse'),
      children: [person('c1'), person('c2')],
    }))

    for (const node of layout.nodes) {
      expect(node.x).toBeGreaterThanOrEqual(layout.contentMinX)
      expect(node.y).toBeGreaterThanOrEqual(layout.contentMinY)
      expect(node.x + NODE_W).toBeLessThanOrEqual(layout.contentMaxX)
      expect(node.y + NODE_H).toBeLessThanOrEqual(layout.contentMaxY)
    }

    expect(layout.canvasWidth).toBe(layout.contentMaxX + PADDING_X)
    expect(layout.canvasHeight).toBe(layout.contentMaxY + PADDING_Y)
  })
})

describe('toFlowGraph', () => {
  const root = person('p', {
    spouse: person('s'),
    children: [person('c1'), person('c2')],
  })

  it('emits one person node per laid-out person, at the same coordinates', () => {
    const layout = computeTreeLayout(root)
    const { nodes } = toFlowGraph(layout)

    const personNodes = nodes.filter(n => n.type === 'person')
    expect(personNodes).toHaveLength(layout.nodes.length)

    for (const laidOut of layout.nodes) {
      const flowNode = personNodes.find(n => n.id === laidOut.id)!
      expect(flowNode.position).toEqual({ x: laidOut.x, y: laidOut.y })
    }
  })

  it('anchors children to a junction at the couple midpoint', () => {
    const layout = computeTreeLayout(root)
    const { nodes, edges } = toFlowGraph(layout)

    const junction = nodes.find(n => n.id === junctionId('p'))!
    const p = layout.nodes.find(n => n.id === 'p')!
    const s = layout.nodes.find(n => n.id === 's')!

    expect(junction.type).toBe('junction')
    expect(junction.position.x).toBeCloseTo((p.x + NODE_W + s.x) / 2, 6)
    expect(junction.position.y).toBe(p.y + NODE_H / 2)

    // Every parent-child edge starts at the junction, not at a parent card.
    const childEdges = edges.filter(e => e.type === 'smoothstep')
    expect(childEdges).toHaveLength(2)
    for (const edge of childEdges) {
      expect(edge.source).toBe(junctionId('p'))
      expect(edge.source.startsWith(JUNCTION_PREFIX)).toBe(true)
    }
  })

  it('centres the junction on a single parent with no spouse', () => {
    const layout = computeTreeLayout(person('solo', { children: [person('kid')] }))
    const { nodes } = toFlowGraph(layout)

    const solo = layout.nodes.find(n => n.id === 'solo')!
    const junction = nodes.find(n => n.id === junctionId('solo'))!

    expect(junction.position.x).toBe(solo.x + NODE_W / 2)
  })

  it('creates no junction for a childless couple', () => {
    const layout = computeTreeLayout(person('a', { spouse: person('b') }))
    const { nodes, edges } = toFlowGraph(layout)

    expect(nodes.filter(n => n.type === 'junction')).toHaveLength(0)
    expect(edges).toHaveLength(1)
    expect(edges[0].type).toBe('couple')
  })
})
