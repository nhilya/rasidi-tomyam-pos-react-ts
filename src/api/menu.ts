import { apiFetch } from '@/lib/api';
import type { ApiMenuItem, ApiCategory } from './types';

export type { ApiCategory };

export interface MenuParams {
  category_id?: number;
  low_stock?: 1;
}

export interface MenuItemPayload {
  name: string;
  description?: string;
  price: number;
  menu_category_id: number;
  image_url?: string;
  stock: number;
  min_stock: number;
}

export interface CategoryPayload {
  name: string;
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
  payload: Partial<MenuItemPayload> & { stock?: number },
): Promise<ApiMenuItem> {
  return apiFetch(`/menu/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteMenuItem(id: number): Promise<{ message: string }> {
  return apiFetch(`/menu/${id}`, { method: 'DELETE' });
}

export async function getCategories(): Promise<ApiCategory[]> {
  return apiFetch('/menu/categories');
}

export async function createCategory(payload: CategoryPayload): Promise<ApiCategory> {
  return apiFetch('/menu/categories', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateCategory(id: number, payload: CategoryPayload): Promise<ApiCategory> {
  return apiFetch(`/menu/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteCategory(id: number): Promise<{ message: string }> {
  return apiFetch(`/menu/categories/${id}`, { method: 'DELETE' });
}
