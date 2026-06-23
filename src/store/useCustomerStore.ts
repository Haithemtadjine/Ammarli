// ─── Ammarli Customer Store ────────────────────────────────────────────────────
// Manages: orders, draft order, notifications, favorites
// NO driver data here — use useDriverStore

import { create } from 'zustand';
import { api } from '../services/api';

// ── Types ─────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'pending'
  | 'searching'
  | 'accepted'
  | 'arrived'
  | 'delivering'
  | 'delivered'
  | 'cancelled'
  | 'scheduled';

export interface Order {
  id: string | number;
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
  driverLocation: { latitude: number; longitude: number } | null;

  // ── Order actions ───────────────────────────────────────────────────────────
  setUserLocation: (location: { latitude: number; longitude: number; address?: string } | null) => void;
  setDriverLocation: (location: { latitude: number; longitude: number } | null) => void;
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

  // ── Network actions ─────────────────────────────────────────────────────────
  fetchActiveOrder: () => Promise<void>;
  fetchPastOrders: () => Promise<void>;
  handleSocketOrderUpdate: (payload: any) => void;
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

export const useCustomerStore = create<CustomerState>((set, get) => ({
  activeOrder: null,
  pastOrders: [],
  scheduledOrders: [],
  draftOrder: INITIAL_DRAFT,
  favorites: [],
  userLocation: null,
  driverLocation: null,
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
  setDriverLocation: (location) => set({ driverLocation: location }),
  
  fetchActiveOrder: async () => {
    try {
      const { data } = await api.get('/requests/active');
      if (data) {
        const mappedOrder: Order = {
          id: data.id,
          type: data.type === 'TANKER' ? 'Tanker' : 'Bottled',
          status: data.status.toLowerCase() as OrderStatus,
          quantity: data.quantity?.toString(),
          price: data.totalPrice || data.subtotal,
          locationName: data.deliveryAddress,
          location: { latitude: data.pickupLat, longitude: data.pickupLng },
          waterType: data.tankerDetails?.waterType,
          items: data.bottledItems,
        };
        set({ activeOrder: mappedOrder });
      } else {
        set({ activeOrder: null });
      }
    } catch (e) {
      console.log('No active order found or error:', e);
    }
  },

  handleSocketOrderUpdate: (payload: any) => {
    if (!payload) return;
    const mappedOrder: Order = {
      id: payload.id,
      type: payload.type === 'TANKER' ? 'Tanker' : 'Bottled',
      status: payload.status.toLowerCase() as OrderStatus,
      quantity: payload.quantity?.toString(),
      price: payload.totalPrice || payload.subtotal,
      locationName: payload.deliveryAddress,
      location: { latitude: payload.pickupLat, longitude: payload.pickupLng },
      waterType: payload.tankerDetails?.waterType,
      items: payload.bottledItems,
    };
    
    set({ activeOrder: mappedOrder });
  },

  fetchPastOrders: async () => {
    try {
      const { data } = await api.get('/requests?limit=50');
      if (data && data.data) {
        const past = data.data.map((r: any): Order => ({
          id: r.id,
          type: r.type === 'TANKER' ? 'Tanker' : 'Bottled',
          status: r.status.toLowerCase() as OrderStatus,
          quantity: r.quantity?.toString(),
          price: r.totalPrice || r.subtotal,
          locationName: r.deliveryAddress,
          location: { latitude: r.pickupLat, longitude: r.pickupLng },
          waterType: r.tankerDetails?.waterType,
          items: r.bottledItems,
          cancelReason: r.cancelReason,
          orderTime: r.createdAt ? new Date(r.createdAt).toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', month: 'short', day: '2-digit' }) : undefined,
          schedulingInfo: r.isScheduled ? { date: r.scheduledDate, time: r.scheduledTime } : undefined,
        }));
        set({ pastOrders: past });
      }
    } catch (e) {
      console.log('Failed to fetch past orders:', e);
    }
  },
  
  createOrder: async (order) => {
    try {
      const isTanker = order.type === 'Tanker' || order.type === 'Well' || order.type === 'Spring' || order.type === 'Ashghal';
      const payload = {
        pickupLat: order.location?.latitude || 0,
        pickupLng: order.location?.longitude || 0,
        deliveryAddress: order.locationName,
        quantity: isTanker ? 1 : parseInt(order.quantity || '1', 10),
        type: isTanker ? 'TANKER' : 'BOTTLED',
        tankerDetails: isTanker ? { waterType: order.waterType || order.type, volume: parseInt(order.quantity || '3000', 10) } : undefined,
        bottledItems: !isTanker ? order.items : undefined,
        subtotal: order.price,
        totalPrice: order.price,
        isScheduled: false,
      };
      const res = await api.post('/requests', payload);
      // Update with real ID from backend
      set({ activeOrder: { ...order, id: res.data.id } });
    } catch (error: any) {
      console.error('Failed to create order on backend:', error?.response?.data || error);
      throw error;
    }
  },

  updateOrder: (update) =>
    set((s) => ({
      activeOrder: s.activeOrder ? { ...s.activeOrder, ...update } : null,
    })),

  cancelOrder: async (reason) => {
    const activeId = get().activeOrder?.id;
    if (activeId && typeof activeId === 'string') {
      try {
        await api.post(`/requests/${activeId}/cancel`);
      } catch (e) {
        console.error('Failed to cancel on backend:', e);
      }
    }
    set((s) => ({
      pastOrders: s.activeOrder
        ? [{ ...s.activeOrder, status: 'cancelled', cancelReason: reason }, ...s.pastOrders]
        : s.pastOrders,
      activeOrder: null,
    }));
  },

  completeOrder: async () => {
    const activeId = get().activeOrder?.id;
    if (activeId && typeof activeId === 'string') {
      try {
        await api.post(`/requests/${activeId}/complete`);
      } catch (e) {
        console.error('Failed to complete on backend:', e);
      }
    }
    set((s) => ({
      pastOrders: s.activeOrder
        ? [{ ...s.activeOrder, status: 'delivered' }, ...s.pastOrders]
        : s.pastOrders,
      activeOrder: null,
    }));
  },

  scheduleOrder: async (order, date, time) => {
    try {
      await api.post('/requests', {
        pickupLat: order.location?.latitude || 0,
        pickupLng: order.location?.longitude || 0,
        type: order.type === 'Tanker' ? 'TANKER' : 'BOTTLED',
        isScheduled: true,
        scheduledDate: date,
        scheduledTime: time,
      });
      set((s) => ({
        pastOrders: [
          { ...order, status: 'scheduled', schedulingInfo: { date, time } },
          ...s.pastOrders,
        ],
      }));
    } catch (e) {
      console.error('Failed to schedule order:', e);
      throw e;
    }
  },

  addScheduledOrder: (order) =>
    set((s) => ({ scheduledOrders: [order, ...s.scheduledOrders] })),

  acceptScheduledOrder: async (id, driver) => {
    // Real implementation would notify backend driver acceptance
    set((s) => ({
      scheduledOrders: s.scheduledOrders.map((o) =>
        o.id === id ? { ...o, status: 'accepted', driver } : o
      ),
    }));
  },

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
