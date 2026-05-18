// ─── Ammarli Auth Store ────────────────────────────────────────────────────────
// Manages: userRole, userProfile, login flow, logout
// NO customer orders or driver data here — use useCustomerStore / useDriverStore

import { create } from 'zustand';
import { STORAGE_KEYS, storage } from '../utils/storage';

export type UserRole = 'CUSTOMER' | 'DRIVER_BOTTLED' | 'DRIVER_TANKER';

export interface UserProfile {
  name: string;
  phone: string;
  wilaya?: string;
}

interface AuthState {
  userRole: UserRole | null;
  userProfile: UserProfile | null;
  isHydrated: boolean;

  // ── Actions ──────────────────────────────────────────────────────────────────
  setUserRole: (role: UserRole) => Promise<void>;
  setUserProfile: (profile: UserProfile) => Promise<void>;
  updateUserProfile: (profileUpdates: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
  /**
   * Loads persisted auth state from AsyncStorage.
   * Called once on app startup (Splash screen).
   * Returns the loaded role (or null if none found).
   */
  hydrate: () => Promise<UserRole | null>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  userRole: null,
  userProfile: null,
  isHydrated: false,

  setUserRole: async (role) => {
    await storage.set(STORAGE_KEYS.USER_ROLE, role);
    set({ userRole: role });
  },

  setUserProfile: async (profile) => {
    await storage.set(STORAGE_KEYS.USER_PROFILE, profile);
    set({ userProfile: profile });
  },

  updateUserProfile: async (profileUpdates) => {
    const currentProfile = get().userProfile || { name: '', phone: '', wilaya: '' };
    const newProfile = { ...currentProfile, ...profileUpdates };
    await storage.set(STORAGE_KEYS.USER_PROFILE, newProfile);
    set({ userProfile: newProfile });
  },

  logout: async () => {
    await storage.remove(STORAGE_KEYS.USER_ROLE);
    await storage.remove(STORAGE_KEYS.USER_PROFILE);
    set({ userRole: null, userProfile: null });
  },

  hydrate: async () => {
    try {
      const role = await storage.get<UserRole>(STORAGE_KEYS.USER_ROLE);
      const profile = await storage.get<UserProfile>(STORAGE_KEYS.USER_PROFILE);
      set({ userRole: role, userProfile: profile, isHydrated: true });
      return role;
    } catch {
      set({ isHydrated: true });
      return null;
    }
  },
}));
