import { Person } from '@/store/slices/treeSlice'

export function findPersonById(root: Person, segmentId: string): Person | undefined {
  if (!root || root.id === segmentId) return root
  if (root.children) {
    for (const child of root.children) {
      const found = findPersonById(child, segmentId)
      if (found) return found
    }
  }

  return root.spouse && root.spouse.id === segmentId ? root.spouse : undefined
}

export function setPerson(root: Person, segment: Pick<Person, 'id' | 'name' | 'birthDate' | 'deathDate' | 'gender'>): Person {
  if (root.id === segment.id) return { ...root, ...segment }

  const updatedChildren = root.children ? root.children.map(child => setPerson(child, segment)) : undefined
  const updatedSpouse = root.spouse && root.spouse.id === segment.id ? { ...root.spouse, ...segment } : root.spouse

  return {
    ...root,
    children: updatedChildren,
    spouse: updatedSpouse,
  }
}

export function collectAllPersons(root: Person): Person[] {
  const visited = new Set<string>()
  const persons: Person[] = []
  const queue: Person[] = [root]

  while (queue.length > 0) {
    const current = queue.shift()
    if (!current || visited.has(current.id)) continue

    visited.add(current.id)
    persons.push(current)

    if (current.spouse) {
      queue.push(current.spouse)
    }
    if (current.children) {
      queue.push(...current.children)
    }
  }

  return persons
}
