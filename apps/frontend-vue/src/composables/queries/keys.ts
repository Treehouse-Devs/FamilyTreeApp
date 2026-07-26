/**
 * Central query-key factory so invalidations stay consistent across composables.
 */
export const queryKeys = {
  trees: () => ['trees'] as const,
  tree: (treeId: string) => ['trees', treeId] as const,
  person: (treeId: string, personId: string) => ['trees', treeId, 'person', personId] as const,
  profile: () => ['profile'] as const,
}
