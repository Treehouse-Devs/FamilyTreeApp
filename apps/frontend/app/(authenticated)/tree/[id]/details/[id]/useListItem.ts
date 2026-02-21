import { DetailedPerson } from '@/store/slices/treeSlice'
import type { TFunction } from 'i18next'
import { ListItemType } from '@/components/custom/list-item/types'
import { useEffect, useState } from 'react'
import { mapPersonToListItem } from './utils'

export type PersonDetailListItems = {
  category: string
  items: ListItemType[]
}[]

export const useListItem = ({ personDetail, t, onDetailPress }: { personDetail: DetailedPerson | null, t: TFunction, onDetailPress: (id: string, selectedId?: string) => void }): PersonDetailListItems => {
  const [listItems, setListItems] = useState<PersonDetailListItems>([])

  useEffect(() => {
    if (personDetail) {
      const processedListItems = mapPersonToListItem(personDetail, t, onDetailPress)
      setListItems(processedListItems)
    }
  }, [personDetail, t])

  return listItems
}
