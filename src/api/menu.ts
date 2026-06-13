import { apiFetch } from '@/lib/api';
import type { ApiMenuItem } from './types';

export interface MenuParams {
  category?: 'food' | 'drink';
  low_stock?: 1;
}

export interface MenuItemPayload {
  name: string;
  description?: string;
  price: number;
  category: 'food' | 'drink';
  image_url?: string;
  stock: number;
  min_stock: number;
}

export async function getMenu(params?: MenuParams): Promise<{ data: ApiMenuItem[] }> {
  const qs = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
  return apiFetch(`/menu${qs}`);
}

export async function createMenuItem(payload: MenuItemPayload): Promise<ApiMenuItem> {
  return apiFetch('/menu', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateMenuItem(
  id: number,
  payload: Partial<MenuItemPayload>,
): Promise<ApiMenuItem> {
  return apiFetch(`/menu/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteMenuItem(id: number): Promise<{ message: string }> {
  return apiFetch(`/menu/${id}`, { method: 'DELETE' });
}
