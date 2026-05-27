import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="chat" options={{ title: 'গাছের ডাক্তার', headerShown: false }} />
          <Stack.Screen name="calculator" options={{ title: 'সঠি সার হিসাব', headerShown: false }} />
          <Stack.Screen name="loans" options={{ title: 'কৃষি ঋণ ও তথ্য সহায়িকা', headerShown: false }} />
          <Stack.Screen name="articles" options={{ title: 'কৃষি তথ্য ভান্ডার', headerShown: false }} />
          <Stack.Screen name="crops" options={{ title: 'ফসলের বই', headerShown: false }} />
          <Stack.Screen name="irrigation" options={{ title: 'সেচ ও নিষ্কাশন গাইড', headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

