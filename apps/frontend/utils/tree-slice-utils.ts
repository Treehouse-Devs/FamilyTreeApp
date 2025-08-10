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

export function setPerson(root: Person, segment: Person): Person {
  if (root.id === segment.id) return segment

  const updatedChildren = root.children ? root.children.map(child => setPerson(child, segment)) : undefined
  const updatedSpouse = root.spouse && root.spouse.id === segment.id ? segment : root.spouse

  return {
    ...root,
    children: updatedChildren,
    spouse: updatedSpouse,
  }
}

export function countWillRemovedPersons(root: Person, nodeToCount: Person): number {
  return processPerson(root, nodeToCount)
}

function processPerson(root: Person, nodeToProcess: Person): number {
  // If the node to be processed is the root, we cannot remove or count it
  if (root.id === nodeToProcess.id || root.spouse?.id === nodeToProcess.id) return 0

  // Initialize the count of nodes that would be removed or processed
  let processedCount = 0

  // If the node to be processed is an in-law, we preserve the spouse and process descendants only
  if (!nodeToProcess.isBloodRelated) {
    // Process the spouse and count descendants
    if (nodeToProcess.spouse) {
      // Process all children and descendants
      if (nodeToProcess.children && nodeToProcess.children.length > 0) {
        while (nodeToProcess.children.length > 0) {
          processedCount += processDescendants(nodeToProcess.children[0])
        }
      }
    }
  }

  // Count the node itself and process it (either remove or just count)
  processedCount += 1

  // Return the total count of nodes that would be processed (removed or counted)
  return processedCount
}

// Helper function to recursively process descendants (children, grandchildren, etc.)
function processDescendants(node: Person): number {
  let processedCount = 0

  // Recursively process children and further descendants
  if (node.children && node.children.length > 0) {
    while (node.children.length > 0) {
      processedCount += processDescendants(node.children[0]) // Process children one by one
    }
  }

  // Process the node itself
  processedCount += 1

  return processedCount
}
