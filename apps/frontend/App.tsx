import { NavigationContainer, DarkTheme, DefaultTheme, Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useColorScheme, View } from 'react-native';

const Stack = createNativeStackNavigator();

export default function App() {
  const colorScheme = useColorScheme();
  const theme: Theme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator>
        <View>
        </View>
        {/* <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ViewTree" component={ViewTreeScreen} /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
