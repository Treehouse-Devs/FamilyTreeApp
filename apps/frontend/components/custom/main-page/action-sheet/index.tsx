import { View, Image, Text } from 'react-native'
import { Settings, LogOut } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { ActionSheet, ActionSheetItemWithIcon } from '@/components/custom/action-sheet'
import { useUser } from '@/hooks/useUser'
import { useAuth } from '@/hooks/useAuth'
import DUMMY_MALE from '@/assets/images/dummy-profile-male.webp'
import { router } from 'expo-router'

export const MainPageActionSheet = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { t } = useTranslation()
  const { user } = useUser()
  const { logout } = useAuth()

  const avatarSource = user?.avatarUrl ? { uri: user.avatarUrl } : DUMMY_MALE

  const actionItems = [
    {
      icon: Settings,
      text: t('settings'),
      onPress: () => {
        onClose()
        router.push('/settings')
      },
    },
    {
      icon: LogOut,
      text: t('logout'),
      onPress: () => {
        onClose()
        logout()
      },
      destructive: true,
    },
  ]

  return (
    <ActionSheet isOpen={isOpen} onClose={onClose}>
      {/* Profile Header */}
      <View className="flex-row items-center py-4 px-2">
        <View className="w-14 h-14 rounded-full bg-primary-800 overflow-hidden mr-3">
          <Image
            source={avatarSource}
            className="w-full h-full"
          />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-semibold text-primary-800">
            {user?.name ?? ''}
          </Text>
          <Text className="text-sm text-primary-600">
            {user?.email ?? ''}
          </Text>
        </View>
      </View>

      {/* Divider */}
      <View className="h-px bg-primary-800/50 mb-2 mx-2" />

      {actionItems.map((item, index) => (
        <ActionSheetItemWithIcon
          key={index}
          icon={item.icon}
          text={item.text}
          onPress={item.onPress}
          destructive={item.destructive}
        />
      ))}
    </ActionSheet>
  )
}
