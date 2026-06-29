import type { Collection, ObjectId } from 'mongodb';
import { getDb } from '../db/mongo';
import { buildMongoUpdate } from '../db/utils';

export interface DbMonthlyBillSharedData {
  otherUserId: ObjectId;
  otherAmount: number;
  otherPaidAt?: Date;
  payerConfirmedAt?: Date;
}

export interface DbMonthlyBill {
  _id: ObjectId;
  billId: ObjectId;
  userId: ObjectId;
  year: number;
  month: number;
  amount?: number;
  paidAt?: Date;
  sharedData?: DbMonthlyBillSharedData;
}

export async function getCollection(): Promise<Collection<DbMonthlyBill>> {
  const db = await getDb();
  return db.collection<DbMonthlyBill>('monthlyBills');
}

export async function listByUserAndMonth(
  userId: ObjectId,
  year: number,
  month: number,
): Promise<DbMonthlyBill[]> {
  const col = await getCollection();
  return col.find({ userId, year, month }).toArray();
}

export async function findByBillAndMonth(
  billId: ObjectId,
  userId: ObjectId,
  year: number,
  month: number,
): Promise<DbMonthlyBill | null> {
  const col = await getCollection();
  return col.findOne({ billId, userId, year, month });
}

export async function insertMany(docs: Omit<DbMonthlyBill, '_id'>[]): Promise<DbMonthlyBill[]> {
  if (docs.length === 0) return [];
  const col = await getCollection();
  const result = await col.insertMany(docs as DbMonthlyBill[]);
  return docs.map((doc, i) => ({ ...doc, _id: result.insertedIds[i]! }) as DbMonthlyBill);
}

export async function update(
  id: ObjectId,
  userId: ObjectId,
  patch: Partial<Omit<DbMonthlyBill, '_id' | 'billId' | 'userId' | 'year' | 'month'>>,
): Promise<DbMonthlyBill | null> {
  const col = await getCollection();
  return col.findOneAndUpdate(
    { _id: id, userId },
    buildMongoUpdate(patch as Record<string, unknown>),
    { returnDocument: 'after' },
  );
}

export async function updateSharedPaid(
  billId: ObjectId,
  userId: ObjectId,
  year: number,
  month: number,
): Promise<DbMonthlyBill | null> {
  const col = await getCollection();
  return col.findOneAndUpdate(
    { billId, userId, year, month },
    { $set: { 'sharedData.otherPaidAt': new Date() } },
    { returnDocument: 'after' },
  );
}

export async function updateSharedConfirm(
  billId: ObjectId,
  userId: ObjectId,
  year: number,
  month: number,
): Promise<DbMonthlyBill | null> {
  const col = await getCollection();
  return col.findOneAndUpdate(
    { billId, userId, year, month },
    { $set: { 'sharedData.payerConfirmedAt': new Date() } },
    { returnDocument: 'after' },
  );
}
