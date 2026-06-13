import { apiFetch } from '@/lib/api';
import type { ApiUser, PaginatedResponse } from './types';

export type StaffRole = 'boss' | 'manager' | 'supervisor' | 'cashier' | 'server';

export interface CreateStaffPayload {
  name: string;
  phone: string;
  password: string;
  role: string;
}

export interface UpdateStaffPayload {
  name?: string;
  phone?: string;
  password?: string;
  role?: string;
}

export async function getStaff(): Promise<PaginatedResponse<ApiUser>> {
  return apiFetch('/staff');
}

export async function getPastStaff(): Promise<PaginatedResponse<ApiUser>> {
  return apiFetch('/staff/past');
}

export async function getRoles(): Promise<string[]> {
  return apiFetch('/roles');
}

export async function createStaff(payload: CreateStaffPayload): Promise<ApiUser> {
  return apiFetch('/staff', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateStaff(id: number, payload: UpdateStaffPayload): Promise<ApiUser> {
  return apiFetch(`/staff/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteStaff(id: number): Promise<{ message: string }> {
  return apiFetch(`/staff/${id}`, { method: 'DELETE' });
}
