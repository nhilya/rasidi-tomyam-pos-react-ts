import { apiFetch, setToken, clearToken } from '@/lib/api';
import type { ApiUser } from './types';

export interface LoginResponse {
  token: string;
  user: ApiUser;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ email, password }),
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
