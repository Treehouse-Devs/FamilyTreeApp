import { validateFamilyGraph } from '../tree-validate'
import type { FlatPerson } from '../tree-compose'

const p = (over: Partial<FlatPerson> & { id: string }): FlatPerson => ({
  name: over.id,
  gender: 'male' as FlatPerson['gender'],
  ...over,
})

const codes = (persons: FlatPerson[], rootId?: string) =>
  validateFamilyGraph(persons, rootId).map(i => i.code)

describe('validateFamilyGraph', () => {
  it('returns no issues for a clean single-lineage tree', () => {
    const persons = [
      p({ id: 'A', birthDate: 1, spouseId: 'B' }),
      p({ id: 'B', spouseId: 'A' }),
      p({ id: 'C', fatherId: 'A', motherId: 'B' }),
    ]
    expect(validateFamilyGraph(persons, 'A')).toEqual([])
  })

  it('flags a parent cycle and stops further checks', () => {
    const persons = [
      p({ id: 'A', fatherId: 'B' }),
      p({ id: 'B', fatherId: 'A' }),
    ]
    const issues = validateFamilyGraph(persons, 'A')
    expect(issues).toHaveLength(1)
    expect(issues[0].code).toBe('CYCLE')
    expect(issues[0].level).toBe('error')
    // The cycle members are reported.
    expect(issues[0].personIds.sort()).toEqual(['A', 'B'])
  })

  it('does NOT error on a converging-lineage couple (now drawable by the generation layout)', () => {
    const persons = [
      p({ id: 'PF' }),
      p({ id: 'PM' }),
      p({ id: 'F', fatherId: 'PF', spouseId: 'M' }),
      p({ id: 'M', motherId: 'PM', spouseId: 'F' }),
      p({ id: 'C', fatherId: 'F', motherId: 'M' }),
    ]
    const issues = validateFamilyGraph(persons, 'PF')
    expect(issues.some(i => i.level === 'error')).toBe(false)
  })

  it('warns when one person is referenced as the spouse of several people', () => {
    const persons = [
      p({ id: 'H' }),
      p({ id: 'W1', spouseId: 'H' }),
      p({ id: 'W2', spouseId: 'H' }),
    ]
    const issue = validateFamilyGraph(persons, 'H').find(i => i.code === 'MULTIPLE_SPOUSES')
    expect(issue).toBeDefined()
    expect(issue!.level).toBe('warning')
    expect(issue!.personIds).toEqual(expect.arrayContaining(['H', 'W1', 'W2']))
  })

  it('warns on a dangling spouse link', () => {
    const persons = [p({ id: 'A', spouseId: 'ghost' })]
    expect(codes(persons, 'A')).toContain('DANGLING_SPOUSE')
  })

  it('warns STALE_ROOT when the declared root is absent', () => {
    const persons = [p({ id: 'R', birthDate: 1 })]
    expect(codes(persons, 'DELETED')).toContain('STALE_ROOT')
  })

  it('warns STALE_ROOT when the declared root now has parents', () => {
    const persons = [
      p({ id: 'F' }),
      p({ id: 'R', fatherId: 'F' }), // R was the root but gained a parent
    ]
    expect(codes(persons, 'R')).toContain('STALE_ROOT')
  })

  it('warns MISSING_ROOT when everyone points at a (non-existent) parent', () => {
    const persons = [p({ id: 'A', fatherId: 'ghost' })]
    const c = codes(persons)
    expect(c).toContain('MISSING_ROOT')
    expect(c).not.toContain('CYCLE')
  })
})
