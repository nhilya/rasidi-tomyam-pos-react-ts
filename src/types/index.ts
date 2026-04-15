export type Role = 'super_admin' | 'manager' | 'cashier' | 'supervisor' | 'server';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role | 'customer';
  phone?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  isRegistered: boolean;
  createdAt: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'food' | 'drink';
  image?: string;
  stock: number;
  minStock: number;
}

export interface OrderItem {
  menuItemId: string;
  quantity: number;
  price: number;
  notes?: string;
}

export type OrderStatus = 'pending' | 'preparing' | 'served' | 'paid' | 'cancelled';
export type OrderPlatform = 'pos' | 'customer_pwa' | 'foodpanda' | 'shopeefood';

export interface Order {
  id: string;
  tableNumber: string;
  items: OrderItem[];
  status: OrderStatus;
  platform: OrderPlatform;
  total: number;
  discount?: number;
  createdAt: string;
  paidAt?: string;
  paymentMethod?: 'cash' | 'card' | 'online';
  createdBy: string; // userId or 'customer'
  customerId?: string;
  customerDetails?: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface Expense {
  id: string;
  type: 'salary' | 'inventory' | 'utility' | 'other';
  amount: number;
  description: string;
  date: string;
  receiptUrl?: string;
  recordedBy: string;
}

export interface InventoryLog {
  id: string;
  menuItemId: string;
  change: number;
  type: 'sale' | 'restock' | 'waste';
  reason?: string;
  createdAt: string;
}

export interface FinancialReport {
  period: string; // e.g., "2024-04"
  sales: number;
  expenses: number;
  profit: number;
}
