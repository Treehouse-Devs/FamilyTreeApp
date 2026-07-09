import { validateFamilyGraph } from '../tree-validate'
import type { FlatPerson } from '../tree-compose'

const p = (over: Partial<FlatPerson> & { id: string }): FlatPerson => ({
  name: over.id,
  isBloodRelated: true,
  gender: 'male' as FlatPerson['gender'],
  ...over,
})

const codes = (persons: FlatPerson[], rootId?: string) =>
  validateFamilyGraph(persons, rootId).map(i => i.code)

describe('validateFamilyGraph', () => {
  it('returns no issues for a clean single-lineage tree', () => {
    const persons = [
      p({ id: 'A', birthDate: 1, spouseId: 'B' }),
      p({ id: 'B', isBloodRelated: false, spouseId: 'A' }),
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

  it('flags DAG_CHILD_COLLISION when both partners have their own ancestry', () => {
    const persons = [
      p({ id: 'PF' }),
      p({ id: 'PM' }),
      p({ id: 'F', fatherId: 'PF', spouseId: 'M' }),
      p({ id: 'M', motherId: 'PM', spouseId: 'F', isBloodRelated: false }),
      p({ id: 'C', fatherId: 'F', motherId: 'M' }),
    ]
    const issues = validateFamilyGraph(persons, 'PF')
    const dag = issues.find(i => i.code === 'DAG_CHILD_COLLISION')
    expect(dag).toBeDefined()
    expect(dag!.level).toBe('error')
    expect(dag!.personIds).toEqual(expect.arrayContaining(['F', 'M', 'C']))
  })

  it('reports DAG_CHILD_COLLISION once per couple even with several shared children', () => {
    const persons = [
      p({ id: 'PF' }),
      p({ id: 'PM' }),
      p({ id: 'F', fatherId: 'PF', spouseId: 'M' }),
      p({ id: 'M', motherId: 'PM', spouseId: 'F', isBloodRelated: false }),
      p({ id: 'C1', fatherId: 'F', motherId: 'M' }),
      p({ id: 'C2', fatherId: 'F', motherId: 'M' }),
    ]
    const dagIssues = validateFamilyGraph(persons, 'PF').filter(i => i.code === 'DAG_CHILD_COLLISION')
    expect(dagIssues).toHaveLength(1)
  })

  it('does NOT flag a normal couple where only one partner has ancestry', () => {
    const persons = [
      p({ id: 'G' }),
      p({ id: 'F', fatherId: 'G', spouseId: 'M' }), // blood, has a parent
      p({ id: 'M', spouseId: 'F', isBloodRelated: false }), // in-law, no parents
      p({ id: 'C', fatherId: 'F', motherId: 'M' }),
    ]
    expect(codes(persons, 'G')).not.toContain('DAG_CHILD_COLLISION')
  })

  it('warns when one person is referenced as the spouse of several people', () => {
    const persons = [
      p({ id: 'H' }),
      p({ id: 'W1', isBloodRelated: false, spouseId: 'H' }),
      p({ id: 'W2', isBloodRelated: false, spouseId: 'H' }),
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
