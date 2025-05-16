import { create } from "zustand";
import { persist } from "zustand/middleware";
import { addDays, format, startOfDay, isSameDay, parseISO } from "date-fns";
import axios from "axios";

export interface Task {
  _id: string;
  title: string;
  description?: string;
  date: string;
  completed: boolean;
  status: "pending" | "completed" | "in-progress";
  createdBy: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

export interface SpecialDay {
  _id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  category?: Category;
  createdAt: string;
  createdBy: string;
}

export interface Category {
  _id: string;
  name: string;
  color: string;
  createdBy: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

interface CalendarState {
  currentMonth: Date;
  selectedDate: string | null;
  tasks: Task[];
  specialDays: SpecialDay[];
  isLoading: boolean;
  error: string | null;
  categories: Category[];

  setCurrentMonth: (date: Date) => void;
  setSelectedDate: (date: string | null) => void;
  loadTasks: () => Promise<void>;
  loadSpecialDays: () => Promise<void>;
  addTask: (task: Omit<Task, "_id" | "createdBy">) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  addSpecialDay: (
    specialDay: Omit<SpecialDay, "_id" | "createdAt" | "createdBy">
  ) => Promise<void>;
  updateSpecialDay: (
    id: string,
    updates: Partial<Omit<SpecialDay, "_id" | "createdAt" | "createdBy">>
  ) => Promise<void>;
  deleteSpecialDay: (id: string) => Promise<void>;
  getTasksForDate: (dateStr: string) => Task[];
  hasTasksOnDate: (dateStr: string) => boolean;
  isSpecialDay: (dateStr: string) => SpecialDay | undefined;
  loadCategories: () => Promise<void>;
  addCategory: (
    category: Omit<Category, "_id" | "createdAt" | "createdBy">
  ) => Promise<void>;
  updateCategory: (
    id: string,
    updates: Partial<Omit<Category, "_id" | "createdAt" | "createdBy">>
  ) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

const API_URL = "https://calendarproject-production.up.railway.app/api";

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => ({
      currentMonth: new Date(),
      selectedDate: null,
      tasks: [],
      specialDays: [],
      isLoading: false,
      error: null,
      categories: [],

      setCurrentMonth: (date) => set({ currentMonth: date }),
      setSelectedDate: (date) => set({ selectedDate: date }),

      loadTasks: async () => {
        try {
          set({ isLoading: true, error: null });
          const token = localStorage.getItem("token");
          const response = await fetch(`${API_URL}/tasks`, {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });

          if (!response.ok) {
            throw new Error("Failed to load tasks");
          }

          const data = await response.json();
          const tasks = Array.isArray(data) ? data : [];
          set({ tasks, isLoading: false });
        } catch (error) {
          console.error("Load tasks error:", error);
          set({ tasks: [], error: "Failed to load tasks", isLoading: false });
        }
      },

      loadSpecialDays: async () => {
        try {
          set({ isLoading: true, error: null });
          const token = localStorage.getItem("token");

          await get().loadCategories();

          const response = await fetch(`${API_URL}/special-days`, {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });

          if (!response.ok) {
            throw new Error("Failed to load special days");
          }

          const specialDays = await response.json();

          const updatedSpecialDays = specialDays.map((day: SpecialDay) => {
            const category = get().categories.find(
              (c) => c._id === day.category?._id
            );
            if (!category) {
              console.warn(`Category not found for special day: ${day._id}`);
            }
            return {
              ...day,
              category: category || day.category,
            };
          });

          set({ specialDays: updatedSpecialDays, isLoading: false });
        } catch (error) {
          console.error("Load special days error:", error);
          set({
            error: "Error loading special days",
            isLoading: false,
            specialDays: [],
          });
        }
      },

      addTask: async (task) => {
        try {
          set({ isLoading: true, error: null });
          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("Not authenticated");
          }
          const response = await axios.post(`${API_URL}/tasks`, task, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          set((state) => ({
            tasks: [...state.tasks, response.data],
            isLoading: false,
          }));
        } catch (error) {
          console.error("Add task error:", error);
          set({ error: "Failed to add task", isLoading: false });
          throw new Error("Failed to add task");
        }
      },

      updateTask: async (taskId, updates) => {
        try {
          set({ isLoading: true, error: null });
          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("Not authenticated");
          }
          const response = await axios.put(
            `${API_URL}/tasks/${taskId}`,
            updates,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          set((state) => ({
            tasks: state.tasks.map((task) =>
              task._id === taskId ? response.data : task
            ),
            isLoading: false,
          }));
        } catch (error) {
          console.error("Update task error:", error);
          set({ error: "Failed to update task", isLoading: false });
          throw new Error("Failed to update task");
        }
      },

      deleteTask: async (taskId) => {
        try {
          set({ isLoading: true, error: null });
          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("Not authenticated");
          }
          await axios.delete(`${API_URL}/tasks/${taskId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          set((state) => ({
            tasks: state.tasks.filter((task) => task._id !== taskId),
            isLoading: false,
          }));
        } catch (error) {
          console.error("Delete task error:", error);
          set({ error: "Failed to delete task", isLoading: false });
          throw new Error("Failed to delete task");
        }
      },

      addSpecialDay: async (specialDay) => {
        try {
          set({ isLoading: true, error: null });
          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("Not authenticated");
          }

          const response = await fetch(`${API_URL}/special-days`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              ...specialDay,
              category: specialDay.category?._id,
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to add special day");
          }

          const newSpecialDay = await response.json();
          set((state) => ({
            specialDays: [...state.specialDays, newSpecialDay],
            isLoading: false,
          }));
        } catch (error) {
          console.error("Add special day error:", error);
          set({ error: "Failed to add special day", isLoading: false });
          throw error;
        }
      },

      updateSpecialDay: async (id, updates) => {
        try {
          set({ isLoading: true, error: null });
          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("Not authenticated");
          }

          const response = await fetch(`${API_URL}/special-days/${id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              ...updates,
              category: updates.category?._id,
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to update special day");
          }

          const updatedSpecialDay = await response.json();
          set((state) => ({
            specialDays: state.specialDays.map((day) =>
              day._id === id ? updatedSpecialDay : day
            ),
            isLoading: false,
          }));
        } catch (error) {
          console.error("Update special day error:", error);
          set({ error: "Failed to update special day", isLoading: false });
          throw error;
        }
      },

      deleteSpecialDay: async (id) => {
        try {
          set({ isLoading: true, error: null });
          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("Not authenticated");
          }

          const response = await fetch(`${API_URL}/special-days/${id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error("Failed to delete special day");
          }

          set((state) => ({
            specialDays: state.specialDays.filter((day) => day._id !== id),
            isLoading: false,
          }));
        } catch (error) {
          console.error("Delete special day error:", error);
          set({ error: "Failed to delete special day", isLoading: false });
          throw error;
        }
      },

      getTasksForDate: (dateStr) => {
        const state = get();
        if (!Array.isArray(state.tasks)) {
          console.warn('Tasks is not an array:', state.tasks);
          return [];
        }
        return state.tasks.filter((task) => {
          const taskDate = startOfDay(parseISO(task.date));
          const targetDate = startOfDay(parseISO(dateStr));
          return isSameDay(taskDate, targetDate);
        });
      },

      hasTasksOnDate: (dateStr) => {
        const state = get();
        if (!Array.isArray(state.tasks)) {
          console.warn('Tasks is not an array:', state.tasks);
          return false;
        }
        return state.tasks.some((task) => {
          const taskDate = startOfDay(parseISO(task.date));
          const targetDate = startOfDay(parseISO(dateStr));
          return isSameDay(taskDate, targetDate);
        });
      },

      isSpecialDay: (dateStr) => {
        const state = get();
        const targetDate = startOfDay(parseISO(dateStr));
        return state.specialDays.find((day) => {
          const startDate = startOfDay(parseISO(day.startDate));
          const endDate = startOfDay(parseISO(day.endDate));
          return targetDate >= startDate && targetDate <= endDate;
        });
      },

      loadCategories: async () => {
        try {
          set({ isLoading: true, error: null });
          const token = localStorage.getItem("token");
          const response = await fetch(`${API_URL}/categories`, {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });

          if (!response.ok) {
            throw new Error("Failed to load categories");
          }

          const categories = await response.json();
          set({ categories, isLoading: false });
        } catch (error) {
          console.error("Load categories error:", error);
          set({ error: "Failed to load categories", isLoading: false });
          throw error;
        }
      },

      addCategory: async (category) => {
        try {
          set({ isLoading: true, error: null });
          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("Not authenticated");
          }

          const response = await fetch(`${API_URL}/categories`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(category),
          });

          if (!response.ok) {
            throw new Error("Failed to add category");
          }

          const newCategory = await response.json();
          set((state) => ({
            categories: [...state.categories, newCategory],
            isLoading: false,
          }));

          await get().loadSpecialDays();
        } catch (error) {
          console.error("Add category error:", error);
          set({ error: "Failed to add category", isLoading: false });
          throw error;
        }
      },

      updateCategory: async (id, updates) => {
        try {
          set({ isLoading: true, error: null });
          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("Not authenticated");
          }

          const response = await fetch(`${API_URL}/categories/${id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updates),
          });

          if (!response.ok) {
            throw new Error("Failed to update category");
          }

          const updatedCategory = await response.json();
          set((state) => ({
            categories: state.categories.map((cat) =>
              cat._id === id ? updatedCategory : cat
            ),
            isLoading: false,
          }));

          await get().loadSpecialDays();
        } catch (error) {
          console.error("Update category error:", error);
          set({ error: "Failed to update category", isLoading: false });
          throw error;
        }
      },

      deleteCategory: async (id) => {
        try {
          set({ isLoading: true, error: null });
          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("Not authenticated");
          }

          const response = await fetch(`${API_URL}/categories/${id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error("Failed to delete category");
          }

          set((state) => ({
            categories: state.categories.filter((cat) => cat._id !== id),
            isLoading: false,
          }));

          await get().loadSpecialDays();
        } catch (error) {
          console.error("Delete category error:", error);
          set({ error: "Failed to delete category", isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: "calendar-storage",
    }
  )
);
