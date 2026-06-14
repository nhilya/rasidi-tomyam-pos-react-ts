import { apiFetch } from '@/lib/api';
import type { ApiUser, PaginatedResponse } from './types';

export type StaffRole = 'super_admin' | 'boss' | 'staff';

export interface CreateStaffPayload {
  name: string;
  phone: string;
  role: string;
}

export interface CreateStaffResponse {
  staff: ApiUser;
  temporary_password: string;
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

export interface ApiRole {
  id: number;
  name: string;
  permissions: string[];
  is_system: boolean;
}

export async function getRoles(): Promise<ApiRole[]> {
  return apiFetch('/roles');
}

export async function getPermissions(): Promise<Record<string, string[]>> {
  return apiFetch('/permissions');
}

export async function assignPermissions(id: number, permissions: string[]): Promise<ApiUser> {
  return apiFetch(`/staff/${id}/permissions`, {
    method: 'PUT',
    body: JSON.stringify({ permissions }),
  });
}

export async function createStaff(payload: CreateStaffPayload): Promise<CreateStaffResponse> {
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

export async function restoreStaff(id: number): Promise<ApiUser> {
  return apiFetch(`/staff/${id}/restore`, { method: 'POST' });
}

export interface CreateRolePayload {
  name: string;
  permissions: string[];
}

export async function createRole(payload: CreateRolePayload): Promise<ApiRole> {
  return apiFetch('/roles', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateRole(id: number, payload: CreateRolePayload): Promise<ApiRole> {
  return apiFetch(`/roles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteRole(id: number): Promise<{ message: string }> {
  return apiFetch(`/roles/${id}`, { method: 'DELETE' });
}
