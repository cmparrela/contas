// ─── Domain types (serialized — all IDs are strings, dates are ISO strings)
// These are the shapes returned by the API and consumed by the web client.
// The API repos define their own internal types with ObjectId.

// ─── User ──────────────────────────────────────────────────────────────────

export interface User {
  _id: string;
  clerkUserId: string;
  email: string;
  name?: string;
  createdAt: string;
}

// ─── Bill ─────────────────────────────────────────────────────────────────

export type SplitType = 'half' | 'custom';

export interface ExternalContact {
  name: string;
  phone?: string; // used to generate wa.me links
}

export interface BillResponse {
  _id: string;
  userId: string;
  name: string; // "Internet", "Plano saúde Mãe"
  amount?: number; // undefined = variable (user enters each month)
  where?: string; // "App Claro", "Site Copel", "Boleto email"
  notes?: string; // free-form notes
  isShared: boolean;
  sharedWithUserId?: string; // connected user to split with
  externalContact?: ExternalContact; // non-user contact (name + optional phone)
  splitType?: SplitType;
  customSplitAmount?: number; // what the OTHER person pays
  payerUserId?: string; // who pays the full bill (collects from other)
  active: boolean;
  order: number; // for sorting
  createdAt: string;
}

// ─── MonthlyBill ──────────────────────────────────────────────────────────

export interface SharedDataResponse {
  otherUserId: string;
  otherAmount: number;
  otherPaidAt?: string; // ISO date — when other person marked as paid
  payerConfirmedAt?: string; // ISO date — when payer confirmed receiving the PIX
}

export interface MonthlyBillResponse {
  _id: string;
  billId: string;
  userId: string;
  year: number;
  month: number; // 1-12
  amount?: number; // actual amount for this month
  paidAt?: string; // ISO date
  sharedData?: SharedDataResponse;
  // Joined from bills collection (when returned by GET /months/:year/:month):
  bill?: BillResponse;
}

// ─── Connection ───────────────────────────────────────────────────────────

export type ConnectionStatus = 'pending' | 'accepted' | 'rejected';

export interface ConnectionResponse {
  _id: string;
  fromUserId: string;
  toUserId: string;
  fromEmail: string;
  toEmail: string;
  status: ConnectionStatus;
  createdAt: string;
  updatedAt: string;
}
