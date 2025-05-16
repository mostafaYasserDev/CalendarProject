import axios from "axios";

const API_URL = "https://calendarproject-production.up.railway.app/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// إضافة التوكن إلى الطلبات
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// معالجة الأخطاء
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    if (error.response) {
      // تم استلام استجابة من الخادم مع رمز حالة خارج نطاق 2xx
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    } else if (error.request) {
      // تم إرسال الطلب ولكن لم يتم استلام استجابة
      console.error("No response received:", error.request);
    } else {
      // حدث خطأ أثناء إعداد الطلب
      console.error("Error setting up request:", error.message);
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post("/users/login", { email, password });
    return response.data;
  },

  getSystemUsername: async () => {
    const response = await api.get("/auth/system-username");
    return response.data.username;
  },

  localLogin: async (systemUsername: string) => {
    const response = await api.post("/auth/local-login", { systemUsername });
    return response.data;
  },

  checkAdminUsername: async (username: string) => {
    const response = await api.post("/auth/check-admin-username", { username });
    return response.data.isAdmin;
  },

  getProfile: async () => {
    const response = await api.get("/users/profile");
    return response.data;
  },

  getUsers: async () => {
    const response = await api.get("/users");
    return response.data;
  },

  createUser: async (userData: {
    name: string;
    email: string;
    password: string;
    role?: string;
    systemUsername?: string;
  }) => {
    const response = await api.post("/users", userData);
    return response.data;
  },

  updateUser: async (
    id: string,
    userData: {
      name?: string;
      email?: string;
      password?: string;
      systemUsername?: string;
    }
  ) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.post("/auth/change-password", {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};

export const taskAPI = {
  getTasks: async () => {
    const response = await api.get("/tasks");
    return response.data;
  },

  createTask: async (taskData: {
    title: string;
    description?: string;
    date: string;
    status?: string;
  }) => {
    const response = await api.post("/tasks", taskData);
    return response.data;
  },

  updateTask: async (
    id: string,
    taskData: {
      title?: string;
      description?: string;
      date?: string;
      status?: string;
    }
  ) => {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
  },

  deleteTask: async (id: string) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },
};

export const specialDayAPI = {
  getSpecialDays: async () => {
    const response = await api.get("/special-days");
    return response.data;
  },

  createSpecialDay: async (specialDayData: {
    title: string;
    description?: string;
    date: string;
    type: string;
  }) => {
    const response = await api.post("/special-days", specialDayData);
    return response.data;
  },

  updateSpecialDay: async (
    id: string,
    specialDayData: {
      title?: string;
      description?: string;
      date?: string;
      type?: string;
    }
  ) => {
    const response = await api.put(`/special-days/${id}`, specialDayData);
    return response.data;
  },

  deleteSpecialDay: async (id: string) => {
    const response = await api.delete(`/special-days/${id}`);
    return response.data;
  },
};

export default api;
