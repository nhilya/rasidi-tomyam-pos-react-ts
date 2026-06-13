import { apiFetch } from '@/lib/api';
import type { ApiOrder } from './types';

export async function getReceipt(token: string): Promise<ApiOrder> {
  return apiFetch(`/receipts/${token}`, { auth: false });
}
