import { ListItemType } from '@/components/custom/list-item/types'
import { DetailedPerson } from '@/store/slices/treeSlice'
import type { TFunction } from 'i18next'

export type PersonDetailListItems = {
  category: string
  items: ListItemType[]
}[]

export function mapPersonToListItem(person: DetailedPerson, t: TFunction, onDetailPress: (id: string, description?: string) => void): PersonDetailListItems {
  const listItems: PersonDetailListItems = []

  listItems.push({
    category: t('identity'),
    items: [
      {
        id: 'name',
        title: t('name'),
        description: person.name,
        onPress: () => onDetailPress('name'),
      },
      {
        id: 'gender',
        title: t('gender'),
        radioButtons: {
          selectedId: person.gender ?? 'male',
          selections: [
            {
              id: 'male',
              label: t('male'),
              onPress: () => onDetailPress('gender', 'male'),
            },
            {
              id: 'female',
              label: t('female'),
              onPress: () => onDetailPress('gender', 'female'),
            },
          ],
        },
      },
      {
        id: 'birthDate',
        title: t('birthDate'),
        description: formatDate(person.birthDate),
        onPress: () => onDetailPress('birthDate'),
      },
      {
        id: 'stillAlive',
        title: t('isStillAliveQ'),
        radioButtons: {
          selectedId: person.deathDate != null ? 'notAlive' : 'stillAlive',
          selections: [
            {
              id: 'stillAlive',
              label: t('stillAlive'),
              onPress: () => onDetailPress('stillAlive', 'stillAlive'),
            },
            {
              id: 'notAlive',
              label: t('notAlive'),
              onPress: () => onDetailPress('stillAlive', 'notAlive'),
            },
          ],
        },
      },
    ],
  })

  if (person.deathDate != null) {
    listItems[0].items.push({
      id: 'deathDate',
      title: t('deathDate'),
      description: formatDate(person.deathDate),
      onPress: () => onDetailPress('deathDate'),
    })
  }

  ['location', 'contact', 'occupation'].forEach((category: string) => {
    const detail = person[category as keyof DetailedPerson]
    if (detail) {
      listItems.push({
        category: t(category),
        items: Object.entries(detail).map(([key, value]) => ({
          id: key,
          title: t(key),
          description: typeof value === 'string' ? value : value === undefined ? '-' : formatPhoneNumber(value as number),
          onPress: () => onDetailPress(key),
        })),
      })
    }
  })

  return listItems
}

export function formatDate(date: number) {
  return new Date(date).toLocaleDateString()
}

export function formatPhoneNumber(phoneNumber: number | null) {
  if (phoneNumber == null) {
    return '-'
  }
  return phoneNumber.toString().replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
}
