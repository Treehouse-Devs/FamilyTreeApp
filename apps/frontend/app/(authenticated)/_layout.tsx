import { Redirect } from 'expo-router'
import { useAuth } from '@/hooks/useAuth'
import { HomeIcon, PlusIcon, SettingsIcon } from 'lucide-react-native'
import { Tabs } from 'expo-router'
import { Pressable, View } from 'react-native'

export default function AppLayout() {
  const { isLoggedIn } = useAuth()

  if (!isLoggedIn) {
    return <Redirect href="/" />
  }

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: 'blue',
      tabBarButton: ({ children, onPress }) => (
        <Pressable
          style={{ justifyContent: 'center', alignItems: 'center' }}
          android_ripple={{ color: 'transparent' }}
          onPress={onPress}
        >
          {children}
        </Pressable>
      ),
    }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarActiveTintColor: '#D3A98F',
          tabBarIcon: ({ focused }) => <HomeIcon size={24} color={focused ? '#C28762' : '#000000'} />,
        }}
      />
      <Tabs.Screen
        name="add-family"
        options={{
          title: '',
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                position: 'absolute',
                top: -25,
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: focused ? '#C28762' : '#D3A98F',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <PlusIcon size={28} color="white" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarActiveTintColor: '#D3A98F',
          tabBarIcon: ({ focused }) => <SettingsIcon size={24} color={focused ? '#C28762' : '#000000'} />,
        }}
      />
    </Tabs>
  )
}
