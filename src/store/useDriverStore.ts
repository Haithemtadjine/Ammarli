// ─── Ammarli Driver Store ──────────────────────────────────────────────────────
// Manages: driver profile, status, active order, inventory, financials, trips
// NO customer data here — use useCustomerStore

import { create } from 'zustand';
import { api } from '../services/api';

// ── Types ─────────────────────────────────────────────────────────────────────

export type DriverType = 'Tanker' | 'Bottled';
export type DriverStatus = 'AVAILABLE' | 'BUSY' | 'OFFLINE';
export type DriverOrderStatus = 'pending' | 'accepted' | 'driving' | 'arrived' | 'completed';

export interface RegisteredDriver {
  name: string;
  phone: string;
  password?: string;
  truckPlate: string;
  driverType: DriverType;
  waterType?: string;
  capacity?: number;
  brands?: string[];
  location?: { lat: number; lng: number };
}

export interface DriverOrderItem {
  icon: string;
  description: string;
  detail: string;
  price: number;
}

export interface ActiveDriverOrder {
  orderId: string;
  customer: { name: string; phone: string; avatarUrl?: string };
  deliveryAddress: { label: string; distance: string; lat: number; lng: number };
  driverLat: number;
  driverLng: number;
  items: DriverOrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: DriverOrderStatus;
  createdAt: string;
}

export interface PastTrip {
  id: string;
  date: string;
  time: string;
  orderSummary: string;
  customerName: string;
  deliveryType: string;
  amount: number;
  status: 'Completed' | 'Cancelled';
  cancelReason?: string;
}

export interface DriverTransaction {
  id: string;
  customerName: string;
  date: string;
  amount: number;
}

export interface DriverNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  isRead: boolean;
  type: 'order' | 'schedule' | 'fee' | 'system' | 'wallet';
}

export interface WeeklyStatDay {
  day: string;
  amount: number;
}

interface TankerInventory {
  remaining: number;
  total: number;
  waterType: string;
}

interface BottledInventory {
  stock: Record<string, { '0.5L': number; '1.5L': number; '5L': number }>;
}

interface Inventory {
  tanker: TankerInventory;
  bottled: BottledInventory;
}

// ── Store interface ───────────────────────────────────────────────────────────

interface DriverState {
  registeredDriver: RegisteredDriver | null;
  driverStatus: DriverStatus;
  activeDriverOrder: ActiveDriverOrder | null;

  // Financials
  totalEarnings: number;
  walletBalance: number;
  completedTrips: number;
  driverRating: number;
  appCommission: number;
  transactions: DriverTransaction[];
  weeklyStats: WeeklyStatDay[];
  pastTrips: PastTrip[];

  // Inventory
  inventory: Inventory;

  // Notifications
  notifications: DriverNotification[];

  // ── Actions ──────────────────────────────────────────────────────────────────
  registerDriver: (driver: RegisteredDriver) => void;
  updateDriverProfile: (name: string, phone: string) => void;
  updatePassword: (newPassword: string) => void;
  fetchDriverProfile: () => Promise<void>;
  updateDriverLocation: (lat: number, lng: number) => void;

  markAllNotificationsAsRead: () => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;

  setDriverStatus: (status: DriverStatus) => void;

  acceptDriverOrder: (order: ActiveDriverOrder) => void;
  refuseDriverOrder: (requestId: string) => void;
  updateDriverOrderStatus: (status: DriverOrderStatus) => void;
  completeDriverOrder: () => void;
  cancelDriverOrder: (reason: string) => void;
  addPastTrip: (trip: PastTrip) => void;

  refillStock: (type: 'tanker' | 'bottled', amount?: any) => void;
  setDriverBusy: (isBusy: boolean) => void;
  
  handleSocketDispatch: (payload: any) => void;
  handleSocketCancel: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const DAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const buildInitialWeeklyStats = (): WeeklyStatDay[] =>
  DAY_LABELS.map((day) => ({ day, amount: 0 }));

const todayIndexInWeek = (): number => {
  const jsDay = new Date().getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
};

const INITIAL_INVENTORY: Inventory = {
  tanker: { remaining: 3000, total: 5000, waterType: 'SPRING WATER' },
  bottled: {
    stock: {
      Ifri: { '0.5L': 25, '1.5L': 15, '5L': 10 },
      Guedila: { '0.5L': 30, '1.5L': 8, '5L': 22 },
      Saida: { '0.5L': 12, '1.5L': 20, '5L': 5 },
      'Lalla Khedidja': { '0.5L': 40, '1.5L': 18, '5L': 3 },
    },
  },
};

// ── Store ─────────────────────────────────────────────────────────────────────

export const useDriverStore = create<DriverState>((set, get) => ({
  registeredDriver: null,
  driverStatus: 'OFFLINE',
  activeDriverOrder: null,

  totalEarnings: 0,
  walletBalance: 0,
  completedTrips: 0,
  driverRating: 4.9,
  appCommission: 0,
  transactions: [],
  weeklyStats: buildInitialWeeklyStats(),
  pastTrips: [],

  inventory: INITIAL_INVENTORY,

  notifications: [
    {
      id: '1',
      title: 'طلب مجدول متاح!',
      description: 'هناك طلب مجدول للغد يطابق منطقتك، هل ترغب في قبوله مبكراً؟',
      time: 'منذ دقيقتين',
      isRead: false,
      type: 'schedule',
    },
    {
      id: '2',
      title: 'خصم العمولة',
      description: 'تم خصم 250 د.ج كعمولة من رحلتك الأخيرة.',
      time: 'منذ ساعة',
      isRead: false,
      type: 'fee',
    },
    {
      id: '3',
      title: 'تم شحن المحفظة',
      description: 'تم إضافة 5000 د.ج إلى محفظتك بنجاح.',
      time: 'أمس',
      isRead: true,
      type: 'wallet',
    },
  ],

  // ── Notifications Actions ──────────────────────────────────────────────────
  markAllNotificationsAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
    })),

  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
    })),

  clearNotifications: () => set({ notifications: [] }),

  // ── Profile ────────────────────────────────────────────────────────────────
  registerDriver: (driver) =>
    set({
      registeredDriver: driver,
      driverStatus: 'AVAILABLE',
      totalEarnings: 0,
      walletBalance: 0,
      completedTrips: 0,
      weeklyStats: buildInitialWeeklyStats(),
      inventory: {
        ...INITIAL_INVENTORY,
        tanker: {
          total: driver.capacity || 5000,
          remaining: driver.capacity || 5000,
          waterType: driver.waterType || 'Spring',
        }
      }
    }),

  updateDriverProfile: (name, phone) =>
    set((s) => ({
      registeredDriver: s.registeredDriver
        ? { ...s.registeredDriver, name, phone }
        : null,
    })),

  updatePassword: (newPassword) =>
    set((s) => ({
      registeredDriver: s.registeredDriver
        ? { ...s.registeredDriver, password: newPassword }
        : null,
    })),

  fetchDriverProfile: async () => {
    try {
      const res = await api.get('/drivers/me');
      if (res.data) {
        set({
          registeredDriver: {
            name: `${res.data.user?.firstName || ''} ${res.data.user?.lastName || ''}`.trim() || 'السائق',
            phone: res.data.user?.phone || '',
            truckPlate: res.data.truckPlate || '12345-112-16',
            capacity: res.data.capacity || 5000,
            waterType: res.data.waterType || 'spring',
            driverType: res.data.type === 'TANKER' ? 'Tanker' : 'Bottled',
            brands: res.data.inventory ? Object.keys(res.data.inventory) : ['Ifri', 'Guedila'],
            location: { lat: 36.752887, lng: 3.042048 },
          },
        });
      }
    } catch (e) {
      console.error('Failed to fetch driver profile:', e);
    }
  },

  updateDriverLocation: async (lat, lng) => {
    // We emit the location over WebSockets instead of an HTTP PATCH
    const { socketService } = await import('../services/socket');
    socketService.emitLocationUpdate(lat, lng);

    set((s) => ({
      registeredDriver: s.registeredDriver
        ? { ...s.registeredDriver, location: { lat, lng } }
        : null,
    }));
  },

  // ── Status ─────────────────────────────────────────────────────────────────
  setDriverStatus: (status) => set({ driverStatus: status }),

  // ── Active Order ──────────────────────────────────────────────────────────
  handleSocketDispatch: (payload: any) => {
    const mappedOrder: ActiveDriverOrder = {
      orderId: payload.id,
      customer: { 
        name: payload.user?.firstName ? `${payload.user.firstName} ${payload.user.lastName}`.trim() : 'Customer',
        phone: payload.user?.phone || ''
      },
      deliveryAddress: { 
        label: payload.deliveryAddress || 'موقع العميل', 
        distance: '---', // Could calculate from location 
        lat: payload.pickupLat, 
        lng: payload.pickupLng 
      },
      driverLat: get().registeredDriver?.location?.lat || 0,
      driverLng: get().registeredDriver?.location?.lng || 0,
      items: payload.bottledItems ? Object.values(payload.bottledItems).map((i: any) => ({
        icon: 'droplet',
        description: i.brand,
        detail: i.size,
        price: i.unitPrice * i.qty
      })) : [{ icon: 'droplet', description: 'صهريج مياه', detail: `${payload.quantity} لتر`, price: payload.totalPrice }],
      subtotal: payload.subtotal || payload.totalPrice,
      deliveryFee: 0,
      total: payload.totalPrice,
      status: 'pending', // Waiting for driver to accept
      createdAt: new Date().toISOString(),
    };
    
    set({
      activeDriverOrder: mappedOrder,
    });
  },

  handleSocketCancel: () => {
    set({
      activeDriverOrder: null,
      driverStatus: 'AVAILABLE'
    });
  },

  acceptDriverOrder: async (order) => {
    try {
      await api.post(`/dispatch/accept`, { requestId: order.orderId });
      set({
        activeDriverOrder: { ...order, status: 'accepted' },
        driverStatus: 'BUSY',
      });
    } catch (e) { 
      console.error('Failed to accept order:', e); 
      set({ activeDriverOrder: null });
      throw e;
    }
  },

  refuseDriverOrder: async (requestId) => {
    try {
      await api.post(`/dispatch/refuse`, { requestId });
    } catch (e) { console.error('Failed to refuse order:', e); }
    set({ activeDriverOrder: null, driverStatus: 'AVAILABLE' });
  },

  updateDriverOrderStatus: async (status) => {
    const activeId = get().activeDriverOrder?.orderId;
    if (activeId) {
      try {
        if (status === 'arrived') await api.post(`/requests/${activeId}/arrived`);
        if (status === 'driving') await api.post(`/requests/${activeId}/start`);
      } catch (e) { console.error('Failed to update status:', e); }
    }
    set((s) => ({
      activeDriverOrder: s.activeDriverOrder
        ? { ...s.activeDriverOrder, status }
        : null,
    }));
  },

  completeDriverOrder: async (quantityLiters: number = 0) => {
    const activeId = get().activeDriverOrder?.orderId;
    if (activeId) {
      try {
        await api.post(`/requests/${activeId}/complete`);
      } catch (e) { console.error('Failed to complete order:', e); }
    }
    set((s) => {
      if (!s.activeDriverOrder) return { activeDriverOrder: null };

      const earned = s.activeDriverOrder.total;
      const commission = Math.round(earned * 0.1);
      const now = new Date();

      const dateLabel = now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase();
      const timeLabel = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      const newTrip: PastTrip = {
        id: s.activeDriverOrder.orderId,
        date: dateLabel,
        time: timeLabel,
        orderSummary: s.activeDriverOrder.items.map((i) => i.description).join(', ') || 'Delivery',
        customerName: s.activeDriverOrder.customer.name,
        deliveryType: 'Delivery',
        amount: earned,
        status: 'Completed',
      };

      const newTransaction: DriverTransaction = {
        id: s.activeDriverOrder.orderId,
        customerName: s.activeDriverOrder.customer.name,
        date: `${dateLabel} · ${timeLabel}`,
        amount: earned,
      };

      const todayIdx = todayIndexInWeek();
      const updatedWeekly = s.weeklyStats.map((stat, idx) =>
        idx === todayIdx ? { ...stat, amount: stat.amount + earned } : stat,
      );

      const currentRemaining = s.inventory.tanker.remaining;
      const newRemaining = Math.max(0, currentRemaining - quantityLiters);

      return {
        activeDriverOrder: null,
        driverStatus: 'AVAILABLE',
        totalEarnings: s.totalEarnings + earned,
        walletBalance: s.walletBalance + earned,
        appCommission: s.appCommission + commission,
        completedTrips: s.completedTrips + 1,
        weeklyStats: updatedWeekly,
        pastTrips: [newTrip, ...s.pastTrips],
        transactions: [newTransaction, ...s.transactions],
        inventory: {
          ...s.inventory,
          tanker: {
            ...s.inventory.tanker,
            remaining: newRemaining
          }
        }
      };
    });
  },

  cancelDriverOrder: async (reason) => {
    const activeId = get().activeDriverOrder?.orderId;
    if (activeId) {
      try {
        await api.post(`/requests/${activeId}/cancel`);
      } catch (e) { console.error('Failed to cancel order:', e); }
    }
    set((s) => {
      if (!s.activeDriverOrder) return { activeDriverOrder: null };

      const now = new Date();
      const dateLabel = now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase();
      const timeLabel = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      const cancelledTrip: PastTrip = {
        id: s.activeDriverOrder.orderId,
        date: dateLabel,
        time: timeLabel,
        orderSummary: s.activeDriverOrder.items.map((i) => i.description).join(', ') || 'Delivery',
        customerName: s.activeDriverOrder.customer.name,
        deliveryType: 'Cancelled Delivery',
        amount: 0,
        status: 'Cancelled',
        cancelReason: reason,
      };

      return {
        activeDriverOrder: null,
        driverStatus: 'AVAILABLE',
        pastTrips: [cancelledTrip, ...s.pastTrips],
      };
    });
  },

  addPastTrip: (trip) => set((s) => ({ pastTrips: [trip, ...s.pastTrips] })),

  // ── Inventory ─────────────────────────────────────────────────────────────
  refillStock: async (type, amount) => {
    try {
      await api.post('/drivers/me/inventory/refill', { type, amount });
    } catch (e) { console.error('Failed to refill inventory:', e); }
    set((s) => {
      const inv = s.inventory;
      if (type === 'tanker') {
        return {
          inventory: {
            ...inv,
            tanker: { ...inv.tanker, remaining: inv.tanker.total },
          },
        };
      }
      const { brand = 'Ifri', size = '1.5L', qty = 50 } = amount ?? {};
      const brandStock = inv.bottled.stock[brand] ?? {
        '0.5L': 0,
        '1.5L': 0,
        '5L': 0,
      };
      return {
        inventory: {
          ...inv,
          bottled: {
            stock: {
              ...inv.bottled.stock,
              [brand]: {
                ...brandStock,
                [size]: brandStock[size as keyof typeof brandStock] + qty,
              },
            },
          },
        },
      };
    });
  },

  // ── Trip Flow Management ────────────────────────────────────────────────
  setDriverBusy: (isBusy) => set({ driverStatus: isBusy ? 'BUSY' : 'AVAILABLE' }),
}));
