// Types for Family List Component
// Uses DTOs from @myorg/dto if available

import { RefreshControlProps } from 'react-native'

// Directly define FamilyNode type for the list
export type FamilyNode = {
  id: string
  name: string
  picture?: string
  note?: string
  createdAt?: string
  updatedAt?: string
  childrenCount?: number
}

export interface FamilyListProps {
  data: FamilyNode[]
  onSelect?: (item: FamilyNode) => void
  renderItem?: (item: FamilyNode) => React.ReactElement | null
  ListEmptyComponent?: React.ReactElement | null
  refreshControl?: React.ReactElement<RefreshControlProps>
}
