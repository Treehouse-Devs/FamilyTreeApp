import { Person } from '@/store/slices/treeSlice'

export type MemberType = 'parents' | 'spouse' | 'sibling' | 'child'

export type ContentView = 'main' | 'addMember' | 'removeMember'

export type PersonTooltipProps = {
  person: Person | null
  visible: boolean
  treeId: string
  onClose: () => void
  onAddMember: (type: MemberType) => void
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
  onDetailsPress: () => void
  onDeletePress: () => void
  t: (key: string) => string
}

export type AddMemberContentViewProps = {
  person: Person | null
  treeId: string
  onSelectType: (type: MemberType) => void
  t: (key: string) => string
}

export type RemovePersonContentViewProps = {
  person: Person
  treeId: string
  onClose: () => void
  t: (key: string) => string
}
