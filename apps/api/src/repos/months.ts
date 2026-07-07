import type { Collection, ObjectId } from 'mongodb';
import { getDb } from '../db/mongo';
import { buildMongoUpdate } from '../db/utils';

export interface DbMonthlyBillSharedData {
  otherUserId?: ObjectId;
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

/**
 * Propagates a bill's current amount/split to its not-yet-paid monthly instances
 * from (fromYear, fromMonth) onward. Past and already-paid months are left untouched.
 */
export async function propagateAmountChange(
  bill: {
    _id: ObjectId;
    amount?: number;
    isShared: boolean;
    sharedWithUserId?: ObjectId;
    splitType?: 'half' | 'custom';
    customSplitAmount?: number;
  },
  userId: ObjectId,
  fromYear: number,
  fromMonth: number,
): Promise<void> {
  const col = await getCollection();

  const patch: Record<string, unknown> = { amount: bill.amount };
  if (bill.isShared) {
    patch['sharedData.otherAmount'] =
      bill.splitType === 'custom' && bill.customSplitAmount !== undefined
        ? bill.customSplitAmount
        : (bill.amount ?? 0) / 2;
  }

  await col.updateMany(
    {
      billId: bill._id,
      userId,
      paidAt: { $exists: false },
      $or: [{ year: { $gt: fromYear } }, { year: fromYear, month: { $gte: fromMonth } }],
    },
    buildMongoUpdate(patch),
  );
}

export async function updateSharedPaid(
  billId: ObjectId,
  userId: ObjectId,
  year: number,
  month: number,
  paid: boolean,
): Promise<DbMonthlyBill | null> {
  const col = await getCollection();
  return col.findOneAndUpdate(
    { billId, userId, year, month },
    paid
      ? { $set: { 'sharedData.otherPaidAt': new Date() } }
      : { $unset: { 'sharedData.otherPaidAt': '', 'sharedData.payerConfirmedAt': '' } },
    { returnDocument: 'after' },
  );
}

export async function updateSharedConfirm(
  billId: ObjectId,
  userId: ObjectId,
  year: number,
  month: number,
  confirmed: boolean,
): Promise<DbMonthlyBill | null> {
  const col = await getCollection();
  return col.findOneAndUpdate(
    { billId, userId, year, month },
    confirmed
      ? { $set: { 'sharedData.payerConfirmedAt': new Date() } }
      : { $unset: { 'sharedData.payerConfirmedAt': '' } },
    { returnDocument: 'after' },
  );
}
