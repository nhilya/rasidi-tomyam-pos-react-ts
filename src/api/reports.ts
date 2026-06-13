import { apiFetch } from '@/lib/api';
import type { DailySalesReport, FinancialsReport } from './types';

export async function getDailySales(date?: string): Promise<DailySalesReport> {
  const qs = date ? `?date=${date}` : '';
  return apiFetch(`/reports/daily-sales${qs}`);
}

export async function getFinancials(year?: number, month?: number): Promise<FinancialsReport> {
  const params: Record<string, string> = {};
  if (year !== undefined) params.year = String(year);
  if (month !== undefined) params.month = String(month);
  const qs = Object.keys(params).length ? `?${new URLSearchParams(params).toString()}` : '';
  return apiFetch(`/reports/financials${qs}`);
}
