import { apiFetch } from '@/lib/api';
import type { ApiCustomer, ApiOrder, PaginatedResponse } from './types';

export async function getCustomers(): Promise<PaginatedResponse<ApiCustomer>> {
  return apiFetch('/customers');
}

export async function getCustomerHistory(
  id: number,
): Promise<PaginatedResponse<ApiOrder>> {
  return apiFetch(`/customers/${id}/history`);
}
