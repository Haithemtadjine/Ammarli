/**
 * ─── Root Layout ───────────────────────────────────────────────────────────────
 * Responsibilities:
 *  1. Load Cairo font (Arabic + Latin support)
 *  2. Initialize i18n (Arabic default, RTL)
 *  3. Hide native splash screen when fonts are ready
 *  4. Provide GestureHandler + SafeArea context to the whole app
 */

import {
  Cairo_400Regular,
  Cairo_600SemiBold,
  Cairo_700Bold,
  useFonts,
} from '@expo-google-fonts/cairo';
import { SplashScreen, Stack } from 'expo-router';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Initialize i18n side-effect (must be imported before any screen renders)
import '../src/shared/localization/i18n';

// Prevent native splash from hiding until fonts are loaded
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Cairo-Regular': Cairo_400Regular,
    'Cairo-SemiBold': Cairo_600SemiBold,
    'Cairo-Bold': Cairo_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Hide the native splash → our custom /splash screen takes over
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // NOTE: We always render the Stack so expo-router can process
  // router.replace() calls from the splash screen, even while fonts
  // are still loading. The native SplashScreen stays visible until
  // SplashScreen.hideAsync() fires above, so users see no unstyled content.
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="splash" />
          <Stack.Screen name="role-selection" />
          <Stack.Screen name="(customer)" />
          <Stack.Screen name="(driver)" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
