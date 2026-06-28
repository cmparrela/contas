import type { MonthlyBillResponse, UpdateMonthlyBillInput } from '@contas/shared';
import { authedFetch } from '../api-client';

export interface MonthResponse {
  monthlyBills: MonthlyBillResponse[];
  year: number;
  month: number;
}

export async function getMonth(token: string, year: number, month: number): Promise<MonthResponse> {
  const res = await authedFetch(token, `/api/months/${year}/${month}`);
  if (!res.ok) throw new Error(`GET /api/months/${year}/${month} failed: ${res.status}`);
  return res.json() as Promise<MonthResponse>;
}

export async function updateMonthlyBill(
  token: string,
  year: number,
  month: number,
  billId: string,
  body: UpdateMonthlyBillInput,
): Promise<MonthlyBillResponse> {
  const res = await authedFetch(token, `/api/months/${year}/${month}/${billId}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`PUT /api/months/${year}/${month}/${billId} failed: ${res.status}`);
  }
  const data = (await res.json()) as { monthlyBill: MonthlyBillResponse };
  return data.monthlyBill;
}

export async function markSharedPaid(
  token: string,
  year: number,
  month: number,
  billId: string,
): Promise<MonthlyBillResponse> {
  const res = await authedFetch(token, `/api/months/${year}/${month}/${billId}/shared-paid`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(`POST shared-paid failed: ${res.status}`);
  const data = (await res.json()) as { monthlyBill: MonthlyBillResponse };
  return data.monthlyBill;
}

export async function confirmSharedPayment(
  token: string,
  year: number,
  month: number,
  billId: string,
): Promise<MonthlyBillResponse> {
  const res = await authedFetch(token, `/api/months/${year}/${month}/${billId}/shared-confirm`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(`POST shared-confirm failed: ${res.status}`);
  const data = (await res.json()) as { monthlyBill: MonthlyBillResponse };
  return data.monthlyBill;
}
