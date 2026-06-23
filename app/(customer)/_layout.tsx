// Customer Stack Layout
// All screens inside (customer)/ share this layout
import { Stack } from 'expo-router';
import { AppState, AppStateStatus } from 'react-native';
import { useEffect, useRef } from 'react';
import { useCustomerStore } from '../../src/store/useCustomerStore';
import {
  triggerDriverFoundNotification,
  clearAllLocalNotifications,
} from '../../src/services/notificationService';
import * as Notifications from 'expo-notifications';
import { socketService } from '../../src/services/socket';

export default function CustomerLayout() {
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const notifFired = useRef(false);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextState) => {
      const prevState = appState.current;
      appState.current = nextState;

      // ── الزبون أغلق التطبيق وله طلبية نشطة ─────────────────────────────────
      if (prevState === 'active' && nextState === 'background') {
        const { activeOrder } = useCustomerStore.getState();
        if (activeOrder && !notifFired.current) {
          notifFired.current = true;
          // Use the typed function which targets the correct channel + custom sound
          await triggerDriverFoundNotification();
        }
      }

      // ── الزبون عاد للتطبيق ────────────────────────────────────────────────────────────
      if (prevState === 'background' && nextState === 'active') {
        notifFired.current = false;
        await clearAllLocalNotifications();
      }
    });

    // ── Connect Socket and Setup Listeners ─────────────────────────────
    socketService.connectAsUser();

    socketService.on('request_accepted', (data) => {
      console.log('socket event: request_accepted', data);
      useCustomerStore.getState().handleSocketOrderUpdate(data);
    });

    socketService.on('ride_started', (data) => {
      console.log('socket event: ride_started', data);
      useCustomerStore.getState().handleSocketOrderUpdate(data);
    });

    socketService.on('driver_arrived', (data) => {
      console.log('socket event: driver_arrived', data);
      useCustomerStore.getState().handleSocketOrderUpdate(data);
    });

    socketService.on('request_completed', (data) => {
      console.log('socket event: request_completed', data);
      useCustomerStore.getState().handleSocketOrderUpdate(data);
    });

    socketService.on('request_cancelled', (data) => {
      console.log('socket event: request_cancelled', data);
      useCustomerStore.getState().handleSocketOrderUpdate(data);
    });

    return () => {
      subscription.remove();
      socketService.disconnect();
    };
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="login"            options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="register"         options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="forgot-password"  options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="settings"         options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="help"             options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="edit-profile"     options={{ animation: 'slide_from_right' }} />
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
