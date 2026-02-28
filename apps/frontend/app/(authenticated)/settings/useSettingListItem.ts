import { User } from '@/store/slices/userSlice'
import { ColorMode } from '@/store/slices/appSlice'
import { useEffect, useState } from 'react'
import type { ListItemType } from '@/components/custom/list-item/types'
import type { TFunction } from 'i18next'

export type SettingListItemType = {
  category: 'accountSettings' | 'applicationSettings'
  listItems: ListItemType[]
}

export function useSettingListItem({ user, t, colorMode, onPress, onColorModeChange }: { user: User, t: TFunction, colorMode: ColorMode, onPress: (id: string, detail?: string) => void, onColorModeChange: (mode: ColorMode) => void }) {
  const [listItems, setListItems] = useState<SettingListItemType[]>([])

  useEffect(() => {
    setListItems([
      {
        category: 'accountSettings',
        listItems: [
          {
            id: 'name',
            title: t('name'),
            description: user.name,
            onPress: () => onPress('name'),
          },
          {
            id: 'email',
            title: t('email'),
            description: user.email,
            onPress: () => {},
          },
          {
            id: 'password',
            title: t('password'),
            description: '••••••••',
            onPress: () => onPress('password'),
          },
        ],
      },
      {
        category: 'applicationSettings',
        listItems: [
          {
            id: 'language',
            title: t('language'),
            radioButtons: {
              selectedId: user.language,
              selections: [
                {
                  id: 'en',
                  label: t('en'),
                  onPress: () => onPress('language', 'en'),
                },
                {
                  id: 'id',
                  label: t('id'),
                  onPress: () => onPress('language', 'id'),
                },
              ],
            },
          },
          {
            id: 'colorTheme',
            title: t('colorTheme'),
            radioButtons: {
              selectedId: colorMode,
              selections: [
                {
                  id: 'light',
                  label: t('light'),
                  onPress: () => onColorModeChange('light'),
                },
                {
                  id: 'dark',
                  label: t('dark'),
                  onPress: () => onColorModeChange('dark'),
                },
                {
                  id: 'system',
                  label: t('system'),
                  onPress: () => onColorModeChange('system'),
                },
              ],
            },
          },
        ],
      },
    ])
  }, [user, colorMode])

  return { listItems }
}
