import { apiFetch } from '@/lib/api';
import type { ApiTable } from './types';

export async function getTables(): Promise<{ data: ApiTable[] }> {
  return apiFetch('/tables');
}

export async function createTable(number: string): Promise<ApiTable> {
  return apiFetch('/tables', {
    method: 'POST',
    body: JSON.stringify({ number }),
  });
}

export async function deleteTable(id: number): Promise<{ message: string }> {
  return apiFetch(`/tables/${id}`, { method: 'DELETE' });
}

export async function resolveTable(token: string): Promise<ApiTable> {
  return apiFetch(`/tables/resolve/${token}`, { auth: false });
}
