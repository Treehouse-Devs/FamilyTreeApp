import type { Person } from '@/store/slices/tree/types'

export enum MemberType {
  PARENTS = 'parents',
  SPOUSE = 'spouse',
  SIBLING = 'sibling',
  CHILD = 'child',
}

export type ContentView = 'main' | 'addMember' | 'removeMember'

export type PersonTooltipProps = {
  person: Person | null
  visible: boolean
  treeId: string
  onClose: () => void
  onAddMember: (type: MemberType) => Promise<void>
  onViewDetails: () => void
}

export type ActionButtonProps = {
  icon: React.ElementType
  label: string
  onPress?: () => void
  isDestructive?: boolean
  isWide?: boolean
  isDisabled?: boolean
}

export type MainContentViewProps = {
  treeId: string
  person: Person
  year: string
  ageText: string
  onAddPress: () => void
  isAddMemberDisabled: boolean
  onDetailsPress: () => void
  onDeletePress: () => void
  t: (key: string) => string
}

export type AddMemberContentViewProps = {
  onSelectType: (type: MemberType) => Promise<void>
  addActions: Array<{ key: MemberType } & ActionButtonProps>
  t: (key: string) => string
}

export type RemovePersonContentViewProps = {
  person: Person
  treeId: string
  onClose: () => void
  t: (key: string) => string
}
