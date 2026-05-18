// ─── Ammarli Customer Store ────────────────────────────────────────────────────
// Manages: orders, draft order, notifications, favorites
// NO driver data here — use useDriverStore

import { create } from 'zustand';

// ── Types ─────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'pending'
  | 'searching'
  | 'accepted'
  | 'delivering'
  | 'delivered'
  | 'cancelled'
  | 'scheduled';

export interface Order {
  id: number;
  type: string;
  status: OrderStatus;
  quantity?: string;
  price?: number;
  waterType?: string;
  locationName?: string;
  orderTime?: string;
  location?: { latitude: number; longitude: number };
  orderSummary?: string;
  schedulingInfo?: { date: string; time: string };
  items?: Array<{ brand: string; size: string; qty: number; unitPrice: number }>;
  cancelReason?: string;
}

export interface DriverInfo {
  name: string;
  rating: string;
  image: string;
  phone: string;
}

export interface ScheduledOrder {
  id: string;
  status: 'pending' | 'accepted';
  title: string;
  schedule: string;
  iconUri: string;
  driver?: DriverInfo;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'order' | 'promo' | 'driver' | 'schedule';
  isRead: boolean;
}

export interface DraftOrder {
  bottledWaterCart: Record<string, { small: number; medium: number; large: number }>;
  tankerDetails: {
    quantity: number;
    hoseLength: string;
    tankLocation: string;
    floorNumber: number;
  };
  location?: { latitude: number; longitude: number; address?: string };
}

// ── Store ─────────────────────────────────────────────────────────────────────

interface CustomerState {
  activeOrder: Order | null;
  pastOrders: Order[];
  scheduledOrders: ScheduledOrder[];
  draftOrder: DraftOrder;
  favorites: Order[];
  notifications: Notification[];
  userLocation: { latitude: number; longitude: number; address?: string } | null;

  // ── Order actions ───────────────────────────────────────────────────────────
  setUserLocation: (location: { latitude: number; longitude: number; address?: string } | null) => void;
  createOrder: (order: Order) => void;
  updateOrder: (update: Partial<Order>) => void;
  cancelOrder: (reason?: string) => void;
  completeOrder: () => void;
  scheduleOrder: (order: Order, date: string, time: string) => void;
  addScheduledOrder: (order: ScheduledOrder) => void;
  acceptScheduledOrder: (id: string, driver: DriverInfo) => void;

  // ── Draft order actions ─────────────────────────────────────────────────────
  updateDraftOrder: (draft: Partial<DraftOrder>) => void;
  clearDraftOrder: () => void;

  // ── Favorites ───────────────────────────────────────────────────────────────
  addToFavorites: (order: Order) => void;

  // ── Notifications ───────────────────────────────────────────────────────────
  addNotification: (notification: Omit<Notification, 'id' | 'time' | 'isRead'>) => void;
  markAllNotificationsAsRead: () => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
}

const INITIAL_DRAFT: DraftOrder = {
  bottledWaterCart: {},
  tankerDetails: {
    quantity: 3000,
    hoseLength: 'standard',
    tankLocation: 'ground',
    floorNumber: 0,
  },
};

export const useCustomerStore = create<CustomerState>((set) => ({
  activeOrder: null,
  pastOrders: [],
  scheduledOrders: [],
  draftOrder: INITIAL_DRAFT,
  favorites: [],
  userLocation: null,
  notifications: [
    {
      id: 'schedule-acc-1',
      title: 'تم تأكيد موعدك المجدول',
      description: 'السائق أحمد علي أكد استلام طلبك ليوم غد الساعة 10:30 صباحاً. يمكنك التواصل معه الآن.',
      time: 'منذ دقيقتين',
      type: 'schedule',
      isRead: false,
    },
    {
      id: 'welcome-1',
      title: 'مرحباً بك في عمارلي!',
      description: 'اطلب المياه النقية وتوصل إلى بابك في دقائق.',
      time: 'الآن',
      type: 'promo',
      isRead: false,
    },
  ],

  // ── Order actions ───────────────────────────────────────────────────────────
  setUserLocation: (location) => set({ userLocation: location }),
  createOrder: (order) => set({ activeOrder: order }),

  updateOrder: (update) =>
    set((s) => ({
      activeOrder: s.activeOrder ? { ...s.activeOrder, ...update } : null,
    })),

  cancelOrder: (reason) => set((s) => ({
    pastOrders: s.activeOrder
      ? [{ ...s.activeOrder, status: 'cancelled', cancelReason: reason }, ...s.pastOrders]
      : s.pastOrders,
    activeOrder: null,
  })),

  completeOrder: () =>
    set((s) => ({
      pastOrders: s.activeOrder
        ? [{ ...s.activeOrder, status: 'delivered' }, ...s.pastOrders]
        : s.pastOrders,
      activeOrder: null,
    })),

  scheduleOrder: (order, date, time) =>
    set((s) => ({
      pastOrders: [
        { ...order, status: 'scheduled', schedulingInfo: { date, time } },
        ...s.pastOrders,
      ],
    })),

  addScheduledOrder: (order) =>
    set((s) => ({ scheduledOrders: [order, ...s.scheduledOrders] })),

  acceptScheduledOrder: (id, driver) =>
    set((s) => ({
      scheduledOrders: s.scheduledOrders.map((o) =>
        o.id === id ? { ...o, status: 'accepted', driver } : o
      ),
    })),

  // ── Draft order actions ─────────────────────────────────────────────────────
  updateDraftOrder: (draft) =>
    set((s) => ({ draftOrder: { ...s.draftOrder, ...draft } })),

  clearDraftOrder: () => set({ draftOrder: INITIAL_DRAFT }),

  // ── Favorites ───────────────────────────────────────────────────────────────
  addToFavorites: (order) =>
    set((s) => ({ favorites: [order, ...s.favorites] })),

  // ── Notifications ───────────────────────────────────────────────────────────
  addNotification: (noti) => {
    const id = Math.random().toString(36).slice(2, 11);
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    set((s) => ({
      notifications: [{ ...noti, id, time, isRead: false }, ...s.notifications],
    }));
  },

  markAllNotificationsAsRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, isRead: true })),
    })),

  markNotificationRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) => n.id === id ? { ...n, isRead: true } : n),
    })),

  clearNotifications: () => set({ notifications: [] }),
}));
