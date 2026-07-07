import type { Collection, ObjectId } from 'mongodb';
import { getDb } from '../db/mongo';
import { buildMongoUpdate } from '../db/utils';

export interface DbBill {
  _id: ObjectId;
  userId: ObjectId;
  name: string;
  amount?: number;
  where?: string;
  notes?: string;
  isShared: boolean;
  sharedWithUserId?: ObjectId;
  externalContact?: { name: string; phone?: string };
  splitType?: 'half' | 'custom';
  customSplitAmount?: number;
  payerUserId?: ObjectId;
  active: boolean;
  order: number;
  tagIds: ObjectId[];
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
  return col.findOneAndUpdate(
    { _id: id, userId },
    buildMongoUpdate(patch as Record<string, unknown>),
    { returnDocument: 'after' },
  );
}

export async function findByIds(ids: ObjectId[]): Promise<DbBill[]> {
  if (ids.length === 0) return [];
  const col = await getCollection();
  return col.find({ _id: { $in: ids } }).toArray();
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

/** Removes a deleted tag's id from every bill that referenced it */
export async function removeTagFromAllBills(userId: ObjectId, tagId: ObjectId): Promise<void> {
  const col = await getCollection();
  await col.updateMany({ userId }, { $pull: { tagIds: tagId } });
}

/** Persists a new manual order for a set of bills owned by the user */
export async function reorder(userId: ObjectId, orderedIds: ObjectId[]): Promise<void> {
  const col = await getCollection();
  await col.bulkWrite(
    orderedIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id, userId },
        update: { $set: { order: index } },
      },
    })),
  );
}
