import type { DetailedPerson } from '@/store/slices/tree/types'
import type { TFunction } from 'i18next'
import * as ImagePicker from 'expo-image-picker'
import type { PersonDetailListItems } from './useListItem'
import { Gender } from '@treely/dto'

export function mapPersonToListItem(person: DetailedPerson, t: TFunction, onDetailPress: (id: string, selectedId?: string) => void): PersonDetailListItems {
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
          selectedId: person.gender ?? Gender.MALE,
          selections: [
            {
              id: Gender.MALE,
              label: t('male'),
              onPress: () => onDetailPress('gender', Gender.MALE),
            },
            {
              id: Gender.FEMALE,
              label: t('female'),
              onPress: () => onDetailPress('gender', Gender.FEMALE),
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
        id: 'isStillAliveQ',
        title: t('isStillAliveQ'),
        radioButtons: {
          selectedId: person.deathDate != null ? 'notAlive' : 'stillAlive',
          selections: [
            {
              id: 'stillAlive',
              label: t('stillAlive'),
              onPress: () => onDetailPress('isStillAliveQ', 'stillAlive'),
            },
            {
              id: 'notAlive',
              label: t('notAlive'),
              onPress: () => onDetailPress('isStillAliveQ', 'notAlive'),
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
          description: typeof value === 'string' ? (value === '' ? '-' : value) : formatPhoneNumber(value as number),
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

export async function handleImageUpload({
  treeId,
  personId,
  t,
  compressImage,
  onImageSelect,
  onUploadStart,
  onUploadSuccess,
  onUploadError,
  onUploadComplete,
}: {
  treeId: string
  personId: string
  t: TFunction
  compressImage: (uri: string) => Promise<string>
  onImageSelect: (uri: string) => void
  onUploadStart: () => void
  onUploadSuccess: (fullImageUrl: string, imageThumbnailUrl: string) => void
  onUploadError: (error: unknown) => void
  onUploadComplete: () => void
}) {
  // Request permissions
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
  if (status !== ImagePicker.PermissionStatus.GRANTED) {
    alert(t('cameraPermissionRequired'))

    return
  }

  // Launch image picker
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  })

  if (!result.canceled && result.assets[0]) {
    const imageUri = result.assets[0].uri
    onImageSelect(imageUri)

    // Start upload
    onUploadStart()
    try {
      const { TreeService } = await import('@/services/treeService')
      const compressedUri = await compressImage(imageUri)
      const response = await TreeService.updatePersonImageById(
        treeId,
        personId,
        compressedUri,
      )

      onUploadSuccess(response.fullImageUrl, response.imageThumbnailUrl)
    } catch (error) {
      onUploadError(error)
    } finally {
      onUploadComplete()
    }
  }
}
