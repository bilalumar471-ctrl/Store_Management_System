//api.js
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH ====================
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// ==================== PRODUCTS ====================
export const productAPI = {
  getAll: async () => {
    const response = await api.get('/api/products');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/api/products/${id}`);
    return response.data;
  },

  create: async (productData) => {
    const response = await api.post('/api/products', productData);
    return response.data;
  },

  update: async (id, productData) => {
    const response = await api.put(`/api/products/${id}`, productData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/api/products/${id}`);
    return response.data;
  },

  search: async (query) => {
    // Search by name or ID
    const response = await api.get('/api/products');
    const products = response.data;

    if (!query) return products;

    const lowerQuery = query.toLowerCase();
    return products.filter(product =>
      product.name.toLowerCase().includes(lowerQuery) ||
      product.id.toString() === query
    );
  },
};

// ==================== BILLS ====================
export const billAPI = {
  getAll: async () => {
    const response = await api.get('/api/bills');
    return response.data;
  },

  getMyBills: async () => {
    const response = await api.get('/api/bills/my-bills');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/api/bills/${id}`);
    return response.data;
  },

  create: async (billData) => {
    const response = await api.post('/api/bills', billData);
    return response.data;
  },

  getByDateRange: async (startDate, endDate) => {
    const response = await api.get('/api/bills');
    const bills = response.data;

    if (!startDate || !endDate) return bills;

    return bills.filter(bill => {
      const billDate = new Date(bill.created_at);
      return billDate >= new Date(startDate) && billDate <= new Date(endDate);
    });
  },
};

// ==================== REPORTS ====================
export const reportAPI = {
  getDailySales: async (date) => {
    const response = await api.get('/api/reports/sales', {
      params: { date }
    });
    return response.data;
  },

  getProfitLoss: async (startDate, endDate) => {
    const response = await api.get('/api/reports/profit-loss', {
      params: { start_date: startDate, end_date: endDate }
    });
    return response.data;
  },

  // Client-side calculation if backend doesn't have these endpoints
  calculateDailySales: async (date) => {
    const bills = await billAPI.getAll();
    const targetDate = new Date(date).toDateString();

    const dailyBills = bills.filter(bill =>
      new Date(bill.created_at).toDateString() === targetDate
    );

    const totalSales = dailyBills.reduce((sum, bill) => sum + bill.total_amount, 0);
    const totalBills = dailyBills.length;

    return {
      date,
      total_sales: totalSales,
      total_bills: totalBills,
      bills: dailyBills,
    };
  },

  calculateProfitLoss: async (startDate, endDate) => {
    const bills = await billAPI.getByDateRange(startDate, endDate);

    let totalRevenue = 0;
    let totalCost = 0;

    bills.forEach(bill => {
      totalRevenue += bill.total_amount;

      // Calculate cost from bill items
      bill.items.forEach(item => {
        // Assuming you have purchase_price in product
        // This might need adjustment based on your backend
        const cost = item.quantity * (item.purchase_price || 0);
        totalCost += cost;
      });
    });

    const profit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

    return {
      start_date: startDate,
      end_date: endDate,
      total_revenue: totalRevenue,
      total_cost: totalCost,
      profit: profit,
      profit_margin: profitMargin.toFixed(2),
      total_bills: bills.length,
    };
  },
};

// ==================== USERS ====================
export const userAPI = {
  getAll: async () => {
    const response = await api.get('/api/users');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/api/users/${id}`);
    return response.data;
  },

  create: async (userData) => {
    const response = await api.post('/api/users', userData);
    return response.data;
  },

  update: async (id, userData) => {
    const response = await api.put(`/api/users/${id}`, userData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/api/users/${id}`);
    return response.data;
  },
};

export default api;