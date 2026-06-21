import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Set handler to ALWAYS show notification (even when app is open or in background)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
    priority: Notifications.AndroidNotificationPriority.MAX,
  }),
});

export async function setupPushNotifications() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('ammarli-orders', {
      name: 'Ammarli Orders',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      enableVibrate: true,
      sound: 'default',
    });
  }

  if (Device.isDevice) {
    const existingStatus = await Notifications.getPermissionsAsync();
    let isGranted = (existingStatus as any).granted;

    if (!isGranted) {
      const newStatus = await Notifications.requestPermissionsAsync();
      isGranted = (newStatus as any).granted;
    }

    if (!isGranted) {
      console.log('Failed to get push token for push notification!');
    }
  }

  // Category with "Accept" and "Decline" buttons
  await Notifications.setNotificationCategoryAsync('NEW_ORDER', [
    {
      identifier: 'accept',
      buttonTitle: 'قبول',
      options: { opensAppToForeground: true },
    },
    {
      identifier: 'decline',
      buttonTitle: 'رفض',
      options: { isDestructive: true, opensAppToForeground: false },
    },
  ]);

  // Category for active order tap — no buttons, just opens the app
  await Notifications.setNotificationCategoryAsync('ACTIVE_ORDER', []);
}

// ── 1. Target: Customer (When Driver Arrives) ─────────────────────────────
export async function triggerDriverArrivedNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'السائق في الخارج! 📍',
      body: 'سائقك وصل وينتظرك بالخارج. الرجاء استلام الطلبية.',
      sound: true,
      categoryIdentifier: 'CUSTOMER_ORDER_TRACKING',
      data: {
        type: 'CUSTOMER_ORDER_TRACKING',
      },
      priority: Notifications.AndroidNotificationPriority.MAX,
    },
    trigger: null,
  });
}

// ── 2. Target: Driver (When New Order Arrives) ──────────────────────────────
export async function triggerNewOrderNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'طلبية مياه جديدة! 💧',
      body: 'يوجد زبون جديد في منطقتك ينتظر التوصيل.',
      sound: true,
      categoryIdentifier: 'NEW_ORDER', // Shows "قبول" and "رفض" buttons
      data: {
        type: 'NEW_ORDER',
      },
      priority: Notifications.AndroidNotificationPriority.MAX,
    },
    trigger: null,
  });
}

// ── 3. Target: Driver (When Order is Active/Pending) ───────────────────────
export async function triggerPendingOrderReminder() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '⏳ تذكير: طلبية معلقة',
      body: 'لا تنسَ أن لديك طلبية قيد التوصيل حالياً. اضغط للعودة للتفاصيل.',
      sound: true,
      categoryIdentifier: 'ACTIVE_ORDER',
      data: {
        type: 'ACTIVE_ORDER',
      },
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: null,
  });
}

// ── Clear notification tray when the user comes back to the app ──────────────
export async function clearAllLocalNotifications() {
  await Notifications.dismissAllNotificationsAsync();
}
