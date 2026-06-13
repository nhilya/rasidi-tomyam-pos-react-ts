import { apiFetch } from '@/lib/api';
import type { ApiOrder, PaginatedResponse } from './types';

export interface OrdersParams {
  status?: 'pending' | 'preparing' | 'served' | 'paid' | 'cancelled';
  platform?: 'pos' | 'customer_pwa' | 'foodpanda' | 'shopeefood';
  date?: string;
}

export interface CreateOrderPayload {
  table_id?: number;
  customer_id?: number;
  platform: 'pos' | 'customer_pwa' | 'foodpanda' | 'shopeefood';
  discount_amount?: number;
  payment_method?: 'cash' | 'card' | 'online';
  items: {
    menu_item_id: number;
    quantity: number;
    notes?: string;
  }[];
}

export interface PatchOrderStatusPayload {
  status: 'pending' | 'preparing' | 'served' | 'paid' | 'cancelled';
  payment_method?: 'cash' | 'card' | 'online';
}

export interface SyncExternalOrderPayload {
  platform: 'foodpanda' | 'shopeefood';
  external_order_id: string;
  total_amount: number;
  customer_name?: string;
  customer_phone?: string;
  items: {
    menu_item_id: number;
    quantity: number;
    price_at_sale: number;
  }[];
}

export async function getOrders(params?: OrdersParams): Promise<PaginatedResponse<ApiOrder>> {
  const qs = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
  return apiFetch(`/orders${qs}`);
}

export async function createOrder(payload: CreateOrderPayload): Promise<ApiOrder> {
  return apiFetch('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function patchOrderStatus(
  id: number,
  payload: PatchOrderStatusPayload,
): Promise<ApiOrder> {
  return apiFetch(`/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function syncExternalOrder(payload: SyncExternalOrderPayload): Promise<ApiOrder> {
  return apiFetch('/orders/sync-external', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
