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

// ── Test notification (triggered manually from the dashboard button) ─────────
export async function triggerTestOrderNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🚨 طلبية جديدة بانتظارك!',
      body: 'العميل ياسين يطلب 10 شدات (مياه معبأة). اقبل الطلب الآن.',
      sound: true,
      categoryIdentifier: 'NEW_ORDER',
      data: {
        type: 'NEW_ORDER',
        customerName: 'ياسين',
        price: '2500',
        address: 'الجزائر العاصمة',
        orderType: 'bottles',
        distance: '2.5 كم',
        rating: '4.8',
      },
      priority: Notifications.AndroidNotificationPriority.MAX,
    },
    trigger: null,
  });
}

// ── Incoming order notification when driver is AVAILABLE & app goes background ─
export async function triggerIncomingOrderBackgroundNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🚨 طلبية جديدة بانتظارك!',
      body: 'زبون يطلب مياه في منطقتك. افتح التطبيق لقبول الطلب الآن.',
      sound: true,
      categoryIdentifier: 'NEW_ORDER',
      data: {
        type: 'NEW_ORDER',
        customerName: 'زبون جديد',
        price: '2500',
        address: 'الجزائر العاصمة',
        orderType: 'spring_water',
        distance: '2.5 كم',
        rating: '4.8',
      },
      priority: Notifications.AndroidNotificationPriority.MAX,
    },
    trigger: null,
  });
}

// ── Ongoing notification when driver has an active order & app goes background ─
export async function triggerActiveOrderBackgroundNotification(orderData: {
  customerName: string;
  price: string;
  address: string;
  orderType: string;
  distance: string;
  orderNumber?: string;
}) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '📦 طلبية قيد التوصيل',
      body: `جاري توصيل طلبية ${orderData.customerName} — اضغط للعودة إلى تفاصيل الطلب.`,
      sound: false,
      categoryIdentifier: 'ACTIVE_ORDER',
      data: {
        type: 'ACTIVE_ORDER',
        ...orderData,
      },
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: null,
  });
}

// ── Clear notification tray when the driver comes back to the app ─────────────
export async function clearAllLocalNotifications() {
  await Notifications.dismissAllNotificationsAsync();
}
