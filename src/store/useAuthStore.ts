// ─── Ammarli Auth Store ────────────────────────────────────────────────────────
// Manages: userRole, userProfile, login flow, logout
// NO customer orders or driver data here — use useCustomerStore / useDriverStore

import { create } from 'zustand';
import { STORAGE_KEYS, storage } from '../utils/storage';
import { api } from '../services/api';

export type UserRole = 'CLIENT' | 'DRIVER' | 'ADMIN';

export interface UserProfile {
  id?: string;
  firstName?: string;
  lastName?: string;
  phone: string;
  wilaya?: string;
  driverType?: 'BOTTLED' | 'TANKER';
}

interface AuthState {
  userRole: UserRole | null;
  userProfile: UserProfile | null;
  isHydrated: boolean;
  token: string | null;

  // ── Actions ──────────────────────────────────────────────────────────────────
  login: (phone: string, password: string) => Promise<void>;
  register: (payload: any) => Promise<void>;
  updateUserProfile: (profileUpdates: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<UserRole | null>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  userRole: null,
  userProfile: null,
  isHydrated: false,
  token: null,

  login: async (phone, password) => {
    const { data } = await api.post('/auth/phone/login', { phone, password });
    const { accessToken, user } = data;
    
    await storage.set('AUTH_TOKEN', accessToken);
    await storage.set(STORAGE_KEYS.USER_ROLE, user.role);
    await storage.set(STORAGE_KEYS.USER_PROFILE, user);
    
    set({ token: accessToken, userRole: user.role, userProfile: user });
  },

  register: async (payload) => {
    const { data } = await api.post('/auth/phone/register', payload);
    const { accessToken, user } = data;

    await storage.set('AUTH_TOKEN', accessToken);
    await storage.set(STORAGE_KEYS.USER_ROLE, user.role);
    await storage.set(STORAGE_KEYS.USER_PROFILE, user);
    
    set({ token: accessToken, userRole: user.role, userProfile: user });
  },

  updateUserProfile: async (profileUpdates) => {
    const currentProfile = get().userProfile || { phone: '' };
    try {
      if (currentProfile.id) {
        await api.patch(`/users/${currentProfile.id}`, profileUpdates);
      }
    } catch (e) {
      console.warn('Failed to update profile on backend:', e);
    }
    const newProfile = { ...currentProfile, ...profileUpdates };
    await storage.set(STORAGE_KEYS.USER_PROFILE, newProfile);
    set({ userProfile: newProfile });
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.warn('Logout failed on backend, clearing locally.');
    }
    await storage.remove(STORAGE_KEYS.USER_ROLE);
    await storage.remove(STORAGE_KEYS.USER_PROFILE);
    await storage.remove('AUTH_TOKEN');
    set({ userRole: null, userProfile: null, token: null });
  },

  hydrate: async () => {
    try {
      const token = await storage.get<string>('AUTH_TOKEN');
      const role = await storage.get<UserRole>(STORAGE_KEYS.USER_ROLE);
      const profile = await storage.get<UserProfile>(STORAGE_KEYS.USER_PROFILE);
      
      set({ token, userRole: role, userProfile: profile, isHydrated: true });
      return role;
    } catch {
      set({ isHydrated: true });
      return null;
    }
  },
}));
