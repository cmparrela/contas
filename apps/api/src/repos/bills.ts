import type { Collection, ObjectId } from 'mongodb';
import { getDb } from '../db/mongo';

export interface DbBill {
  _id: ObjectId;
  userId: ObjectId;
  name: string;
  amount?: number;
  where?: string;
  notes?: string;
  isShared: boolean;
  sharedWithUserId?: ObjectId;
  splitType?: 'half' | 'custom';
  customSplitAmount?: number;
  payerUserId?: ObjectId;
  active: boolean;
  order: number;
  createdAt: Date;
}

export async function getCollection(): Promise<Collection<DbBill>> {
  const db = await getDb();
  return db.collection<DbBill>('bills');
}

export async function listActiveByUser(userId: ObjectId): Promise<DbBill[]> {
  const col = await getCollection();
  return col.find({ userId, active: true }).sort({ order: 1, createdAt: 1 }).toArray();
}

export async function listAllByUser(userId: ObjectId): Promise<DbBill[]> {
  const col = await getCollection();
  return col.find({ userId }).sort({ order: 1, createdAt: 1 }).toArray();
}

export async function findById(id: ObjectId): Promise<DbBill | null> {
  const col = await getCollection();
  return col.findOne({ _id: id });
}

export async function findByIdForUser(id: ObjectId, userId: ObjectId): Promise<DbBill | null> {
  const col = await getCollection();
  return col.findOne({ _id: id, userId });
}

export async function create(
  userId: ObjectId,
  data: Omit<DbBill, '_id' | 'userId' | 'createdAt'>,
): Promise<DbBill> {
  const col = await getCollection();
  const doc: Omit<DbBill, '_id'> = {
    userId,
    ...data,
    createdAt: new Date(),
  };
  const result = await col.insertOne(doc as DbBill);
  return { ...doc, _id: result.insertedId } as DbBill;
}

export async function update(
  id: ObjectId,
  userId: ObjectId,
  patch: Partial<Omit<DbBill, '_id' | 'userId' | 'createdAt'>>,
): Promise<DbBill | null> {
  const col = await getCollection();
  const set: Record<string, unknown> = {};
  const unset: Record<string, 1> = {};
  for (const [key, value] of Object.entries(patch)) {
    if (value === null || value === undefined) unset[key] = 1;
    else set[key] = value;
  }
  const updateOp: Record<string, unknown> = {};
  if (Object.keys(set).length) updateOp.$set = set;
  if (Object.keys(unset).length) updateOp.$unset = unset;
  return col.findOneAndUpdate({ _id: id, userId }, updateOp, { returnDocument: 'after' });
}

export async function softDelete(id: ObjectId, userId: ObjectId): Promise<DbBill | null> {
  const col = await getCollection();
  return col.findOneAndUpdate(
    { _id: id, userId },
    { $set: { active: false } },
    { returnDocument: 'after' },
  );
}

/** Also returns bills shared with this user by others */
export async function listSharedWithUser(userId: ObjectId): Promise<DbBill[]> {
  const col = await getCollection();
  return col.find({ sharedWithUserId: userId, active: true }).sort({ order: 1 }).toArray();
}
