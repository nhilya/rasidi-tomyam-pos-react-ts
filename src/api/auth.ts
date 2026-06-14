import { apiFetch, setToken, clearToken } from '@/lib/api';
import type { ApiUser } from './types';

export interface LoginResponse {
  token: string;
  user: ApiUser;
}

export async function login(phone: string, password: string): Promise<LoginResponse> {
  const res = await apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ phone, password }),
  });
  setToken(res.token);
  return res;
}

export async function getMe(): Promise<ApiUser> {
  return apiFetch<ApiUser>('/auth/me');
}

export function logout(): void {
  clearToken();
}

export interface ChangePasswordPayload {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export async function changePassword(payload: ChangePasswordPayload): Promise<{ message: string }> {
  return apiFetch('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
