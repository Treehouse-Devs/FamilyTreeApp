import type { DetailedPerson } from '@/store/slices/tree/types'
import type { TFunction } from 'i18next'
import type { ListItemType } from '@/components/custom/list-item/types'
import { useEffect, useState } from 'react'
import { mapPersonToListItem } from '@/utils/person-detail'

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
