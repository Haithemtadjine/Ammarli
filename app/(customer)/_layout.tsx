// Customer Stack Layout
// All screens inside (customer)/ share this layout
import { Stack } from 'expo-router';
import { AppState, AppStateStatus } from 'react-native';
import { useEffect, useRef } from 'react';
import { useCustomerStore } from '../../src/store/useCustomerStore';
import * as Notifications from 'expo-notifications';

export default function CustomerLayout() {
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const notifFired = useRef(false);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextState) => {
      const prevState = appState.current;
      appState.current = nextState;

      // ── الزبون أغلق التطبيق وله طلبية نشطة ─────────────────────────────
      if (prevState === 'active' && nextState === 'background') {
        const { activeOrder } = useCustomerStore.getState();
        if (activeOrder && !notifFired.current) {
          notifFired.current = true;
          await Notifications.scheduleNotificationAsync({
            content: {
              title: '🚚 سائقك في الطريق!',
              body: 'تم العثور على سائق لطلبيتك. اضغط هنا لتتبع موقع السائق.',
              sound: true,
              data: { type: 'CUSTOMER_ORDER_TRACKING' },
            },
            trigger: null,
          });
        }
      }

      // ── الزبون عاد للتطبيق ───────────────────────────────────────────────
      if (prevState === 'background' && nextState === 'active') {
        notifFired.current = false;
        await Notifications.dismissAllNotificationsAsync();
      }
    });

    return () => subscription.remove();
  }, []);

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
