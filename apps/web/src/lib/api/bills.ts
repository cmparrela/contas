import type { BillResponse, CreateBillInput, UpdateBillInput } from '@contas/shared';
import { authedFetch } from '../api-client';

export async function listBills(token: string): Promise<BillResponse[]> {
  const res = await authedFetch(token, '/api/bills');
  if (!res.ok) throw new Error(`GET /api/bills failed: ${res.status}`);
  const data = (await res.json()) as { bills: BillResponse[] };
  return data.bills;
}

export async function createBill(token: string, body: CreateBillInput): Promise<BillResponse> {
  const res = await authedFetch(token, '/api/bills', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST /api/bills failed: ${res.status}`);
  const data = (await res.json()) as { bill: BillResponse };
  return data.bill;
}

export async function updateBill(
  token: string,
  id: string,
  body: UpdateBillInput,
): Promise<BillResponse> {
  const res = await authedFetch(token, `/api/bills/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PUT /api/bills/${id} failed: ${res.status}`);
  const data = (await res.json()) as { bill: BillResponse };
  return data.bill;
}

export async function deleteBill(token: string, id: string): Promise<void> {
  const res = await authedFetch(token, `/api/bills/${id}`, { method: 'DELETE' });
  if (!res.ok && res.status !== 204) {
    throw new Error(`DELETE /api/bills/${id} failed: ${res.status}`);
  }
}
