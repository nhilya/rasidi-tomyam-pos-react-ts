export interface PaginatedResponse<T> {
  data: T[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface ApiUser {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  roles: string[];
  created_at: string;
}

export interface ApiMenuItem {
  id: number;
  name: string;
  description: string | null;
  price: string;
  category: 'food' | 'drink';
  image_url: string | null;
  stock: number;
  min_stock: number;
  is_low_stock: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiOrderItem {
  id: number;
  menu_item_id: number;
  menu_item: ApiMenuItem;
  quantity: number;
  price_at_sale: string;
  subtotal: string;
  notes: string | null;
}

export interface ApiCustomer {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  is_registered: boolean;
  created_at: string;
}

export interface ApiOrder {
  id: number;
  table_id: number | null;
  customer_id: number | null;
  created_by: number;
  status: 'pending' | 'preparing' | 'served' | 'paid' | 'cancelled';
  platform: 'pos' | 'customer_pwa' | 'foodpanda' | 'shopeefood';
  total_amount: string;
  discount_amount: string;
  payment_method: 'cash' | 'card' | 'online' | null;
  paid_at: string | null;
  receipt_url: string | null;
  whatsapp_url: string | null;
  items: ApiOrderItem[];
  customer: ApiCustomer | null;
  created_at: string;
  updated_at: string;
}

export interface ApiExpense {
  id: number;
  type: 'salary' | 'inventory' | 'utility' | 'other';
  amount: string;
  description: string;
  date: string;
  receipt_url: string | null;
  recorded_by: ApiUser;
  created_at: string;
}

export interface DailySalesReport {
  date: string;
  total_sales: string;
  total_orders: number;
  total_items_sold: number;
  top_items: {
    name: string;
    total_qty: number;
    total_revenue: string;
  }[];
}

export interface ApiTable {
  id: number;
  number: string;
  status: 'available' | 'occupied' | 'reserved';
  current_order_id: number | null;
  current_order: ApiOrder | null;
  qr_token: string;
  created_at: string;
  updated_at: string;
}

export interface FinancialsReport {
  year: number;
  month: number;
  total_sales: string;
  total_expenses: string;
  net_profit: string;
  expenses_by_type: {
    type: string;
    total: string;
  }[];
}
