// Driver Stack Layout — with AppState-based background notification triggers
import { Stack } from 'expo-router';
import { I18nManager, AppState, AppStateStatus } from 'react-native';
import { useEffect, useRef } from 'react';
import { useDriverStore } from '../../src/store/useDriverStore';
import {
  triggerNewOrderNotification,
  triggerPendingOrderReminder,
  clearAllLocalNotifications,
} from '../../src/services/notificationService';

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

export default function DriverLayout() {
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const incomingOrderTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextState) => {
      const prevState = appState.current;
      appState.current = nextState;

      // ── App went to background ──────────────────────────────────────────
      if (prevState === 'active' && nextState === 'background') {
        // Read driver state at the moment of backgrounding
        const storeState = useDriverStore.getState();
        const { driverStatus, activeDriverOrder, registeredDriver } = storeState;

        if (activeDriverOrder) {
          // Driver has an active accepted order → trigger immediate "active order" notification
          await triggerPendingOrderReminder();
        } else if (driverStatus === 'AVAILABLE' && registeredDriver) {
          // Driver is online and available → schedule a "new order" notification after 5 s
          incomingOrderTimer.current = setTimeout(async () => {
            // Double-check the app is still in background before firing
            if (AppState.currentState === 'background') {
              await triggerNewOrderNotification();
            }
          }, 5000);
        }
      }

      // ── App came back to foreground ─────────────────────────────────────
      if (prevState === 'background' && nextState === 'active') {
        // Cancel any pending incoming-order timer
        if (incomingOrderTimer.current) {
          clearTimeout(incomingOrderTimer.current);
          incomingOrderTimer.current = null;
        }
        // Clear the notification tray so stale alerts are dismissed
        await clearAllLocalNotifications();
      }
    });

    return () => {
      subscription.remove();
      if (incomingOrderTimer.current) {
        clearTimeout(incomingOrderTimer.current);
      }
    };
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_left' }} />
  );
}
