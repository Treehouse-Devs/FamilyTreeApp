export type ListItemType = {
  id: string
  title: string
  description?: string
  radioButtons?: {
    selectedId: string
    selections: {
      id: string
      label: string
      onPress?: () => void
    }[]
  }
  onPress?: () => void
}
