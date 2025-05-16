import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface UserState {
  users: User[];
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loadUsers: () => Promise<void>;
  addUser: (userData: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) => Promise<void>;
  updateUser: (
    id: string,
    updates: Partial<Omit<User, "_id">>
  ) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

const API_URL = "calendarproject-production.up.railway.app/api";

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      users: [],
      currentUser: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,

      login: async (email, password) => {
        try {
          set({ isLoading: true, error: null });
          const response = await fetch(`${API_URL}/users/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "فشل تسجيل الدخول");
          }

          const { user, token } = await response.json();
          localStorage.setItem("token", token);
          set({ currentUser: user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          console.error("Login error:", error);
          set({
            error:
              error instanceof Error
                ? error.message
                : "حدث خطأ أثناء تسجيل الدخول",
            isLoading: false,
          });
        }
      },

      logout: () => {
        localStorage.removeItem("token");
        set({ currentUser: null, isAuthenticated: false });
      },
      loadUsers: async () => {
        try {
          set({ isLoading: true, error: null });
          const token = localStorage.getItem("token");
          const response = await fetch(`${API_URL}/users`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error("Failed to load users");
          }

          const users = await response.json();
          set({ users, isLoading: false });
        } catch (error) {
          console.error("Load users error:", error);
          set({ error: "حدث خطأ أثناء تحميل المستخدمين", isLoading: false });
        }
      },

      addUser: async (userData) => {
        try {
          set({ isLoading: true, error: null });
          const token = localStorage.getItem("token");
          const response = await fetch(`${API_URL}/users`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(userData),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to add user");
          }

          const newUser = await response.json();
          set((state) => ({
            users: [...state.users, newUser],
            isLoading: false,
          }));
        } catch (error) {
          console.error("Add user error:", error);
          set({
            error:
              error instanceof Error
                ? error.message
                : "حدث خطأ أثناء إضافة المستخدم",
            isLoading: false,
          });
        }
      },

      updateUser: async (id, updates) => {
        try {
          set({ isLoading: true, error: null });
          const token = localStorage.getItem("token");
          const response = await fetch(`${API_URL}/users/${id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updates),
          });

          if (!response.ok) {
            throw new Error("Failed to update user");
          }

          const updatedUser = await response.json();
          set((state) => ({
            users: state.users.map((user) =>
              user._id === id ? updatedUser : user
            ),
            isLoading: false,
          }));
        } catch (error) {
          console.error("Update user error:", error);
          set({ error: "حدث خطأ أثناء تحديث المستخدم", isLoading: false });
        }
      },

      deleteUser: async (id) => {
        try {
          set({ isLoading: true, error: null });
          const token = localStorage.getItem("token");
          const response = await fetch(`${API_URL}/users/${id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error("Failed to delete user");
          }

          set((state) => ({
            users: state.users.filter((user) => user._id !== id),
            isLoading: false,
          }));
        } catch (error) {
          console.error("Delete user error:", error);
          set({ error: "حدث خطأ أثناء حذف المستخدم", isLoading: false });
        }
      },
    }),
    {
      name: "user-storage",
    }
  )
);
