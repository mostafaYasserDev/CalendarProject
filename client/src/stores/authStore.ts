import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authAPI } from "../services/api";
import { User } from "../types/user";

export type UserRole = "owner" | "admin";

interface AuthAPI {
  login: (data: { email: string; password: string }) => Promise<{ user: User; token: string }>;
  register: (data: { name: string; email: string; password: string; systemUsername: string }) => Promise<{ user: User; token: string }>;
  createUser: (data: { name: string; email: string; password: string; role?: string; systemUsername?: string }) => Promise<User>;
  getCurrentUser: () => Promise<User>;
  updateUser: (id: string, data: Partial<User>) => Promise<User>;
  deleteUser: (id: string) => Promise<void>;
  getAllUsers: () => Promise<User[]>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  localLogin: (systemUsername: string) => Promise<{ user: User; token: string }>;
  checkAdminUsername: (username: string) => Promise<boolean>;
  getSystemUsername: () => Promise<string>;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  localLogin: () => Promise<boolean>;
  logout: () => void;
  getProfile: () => Promise<void>;
  addAdmin: (admin: { name: string; email: string; password: string; systemUsername?: string }) => Promise<void>;
  removeAdmin: (id: string) => Promise<void>;
  isOwner: () => boolean;
  isAdmin: () => boolean;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  users: User[];
  isLocalAdmin: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      users: [],

      login: async (email: string, password: string) => {
        try {
          const data = await authAPI.login(email, password);
          if (data && data.token) {
            localStorage.setItem('token', data.token);
            set({ user: data.user, isAuthenticated: true });
            await get().getProfile();
            return true;
          }
          return false;
        } catch (error) {
          console.error('Login error:', error);
          if (error instanceof Error) {
            throw new Error(error.message);
          }
          throw new Error('Failed to login');
        }
      },

      localLogin: async () => {
        try {
          const systemUsername = await authAPI.getSystemUsername();
          const isAdmin = await authAPI.checkAdminUsername(systemUsername);
          
          if (!isAdmin) {
            return false;
          }

          const data = await authAPI.localLogin(systemUsername);
          
          if (data && data.token) {
            localStorage.setItem('token', data.token);
            const user: User = {
              id: data._id,
              name: data.name,
              email: data.email,
              role: data.role,
              systemUsername: data.systemUsername,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            set({ user, isAuthenticated: true });
            return true;
          }
          return false;
        } catch (error) {
          if (error instanceof Error) {
            console.error(error.message);
          }
          return false;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('calendar-storage');
        set({ user: null, isAuthenticated: false });
      },

      getProfile: async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('No token found');
          }
          const data = await authAPI.getProfile();
          if (data) {
            set({ user: data, isAuthenticated: true });
          } else {
            throw new Error('Invalid profile data');
          }
        } catch (error) {
          console.error('Get profile error:', error);
          localStorage.removeItem('token');
          set({ user: null, isAuthenticated: false });
          throw error;
        }
      },

      addAdmin: async (admin: { name: string; email: string; password: string; systemUsername?: string }) => {
        try {
          const newAdmin = await authAPI.createUser({
            name: admin.name,
            email: admin.email,
            password: admin.password,
            role: "admin",
            systemUsername: admin.systemUsername
          });
          set((state) => ({
            users: [...state.users, newAdmin],
          }));
        } catch (err) {
          const error = err as Error;
          throw new Error(`Failed to add admin: ${error.message}`);
        }
      },

      removeAdmin: async (id) => {
        try {
          await authAPI.deleteUser(id);
        } catch (error) {
          console.error('Remove admin error:', error);
          throw error;
        }
      },

      isOwner: () => {
        const user = get().user;
        return user?.role === "owner";
      },

      isAdmin: () => {
        const user = get().user;
        return user?.role === "admin" || user?.role === "owner";
      },

      changePassword: async (currentPassword: string, newPassword: string) => {
        try {
          await authAPI.changePassword(currentPassword, newPassword);
          return true;
        } catch (err) {
          const error = err as Error;
          console.error("Failed to change password:", error.message);
          return false;
        }
      },

      isLocalAdmin: async () => {
        try {
          const systemUsername = await authAPI.getSystemUsername();
          return await authAPI.checkAdminUsername(systemUsername);
        } catch (error) {
          return false;
        }
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
