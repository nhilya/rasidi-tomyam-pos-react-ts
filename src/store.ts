import { create } from 'zustand';
import type { MenuItem, Order, User, Customer, Expense } from './types';

interface AppState {
  user: User | null;
  menu: MenuItem[];
  orders: Order[];
  customers: Customer[];
  expenses: Expense[];
  setUser: (user: User | null) => void;
  setMenu: (menu: MenuItem[]) => void;
  setOrders: (orders: Order[]) => void;
  addOrder: (order: Order) => void;
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
  addCustomer: (customer: Customer) => void;
  addExpense: (expense: Expense) => void;
}

export const useStore = create<AppState>((set) => ({
  user: { id: '1', name: 'Super Mom', email: 'mom@shop.com', role: 'super_admin' }, // Default for dev
  menu: [
    { id: 'm1', name: 'Nasi Lemak', description: 'Classic Malaysian breakfast', price: 8.5, category: 'food', stock: 50, minStock: 10 },
    { id: 'm2', name: 'Teh Tarik', description: 'Pulled milk tea', price: 3.0, category: 'drink', stock: 100, minStock: 20 },
    { id: 'm3', name: 'Satay Ayam', description: 'Grilled chicken skewers (6pcs)', price: 12.0, category: 'food', stock: 30, minStock: 5 },
  ],
  orders: [],
  customers: [],
  expenses: [],
  setUser: (user) => set({ user }),
  setMenu: (menu) => set({ menu }),
  setOrders: (orders) => set({ orders }),
  addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
  updateOrder: (orderId, updates) => set((state) => ({
    orders: state.orders.map((o) => o.id === orderId ? { ...o, ...updates } : o)
  })),
  addCustomer: (customer) => set((state) => ({ customers: [...state.customers, customer] })),
  addExpense: (expense) => set((state) => ({ expenses: [expense, ...state.expenses] })),
}));
