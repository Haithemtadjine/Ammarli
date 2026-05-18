// Customer Stack Layout
// All screens inside (customer)/ share this layout
import { Stack } from 'expo-router';

export default function CustomerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="login"            options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="register"         options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="forgot-password"  options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="settings"         options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="wallet"           options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="help"             options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="edit-profile"     options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="payments"         options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="security"         options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="privacy"          options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="order-details"    options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="tank-order-details" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="location-picker"  options={{ animation: 'slide_from_bottom', headerShown: false }} />
      <Stack.Screen name="cancel-order"     options={{ animation: 'slide_from_bottom', headerShown: false }} />
      <Stack.Screen name="(tabs)"           options={{ animation: 'fade' }} />
    </Stack>
  );
}
