import { apiFetch } from '@/lib/api';
import type { ApiExpense, PaginatedResponse } from './types';

export interface ExpensesParams {
  type?: 'salary' | 'inventory' | 'utility' | 'other';
  from?: string;
  to?: string;
}

export interface CreateExpensePayload {
  type: 'salary' | 'inventory' | 'utility' | 'other';
  amount: number;
  description: string;
  date: string;
  receipt_url?: string;
}

export async function getExpenses(params?: ExpensesParams): Promise<PaginatedResponse<ApiExpense>> {
  const qs = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
  return apiFetch(`/expenses${qs}`);
}

export async function createExpense(payload: CreateExpensePayload): Promise<ApiExpense> {
  return apiFetch('/expenses', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
