import type { Collection, ObjectId } from 'mongodb';
import { getDb } from '../db/mongo';
import { buildMongoUpdate } from '../db/utils';

export interface DbTag {
  _id: ObjectId;
  userId: ObjectId;
  name: string;
  color: string;
  createdAt: Date;
}

export async function getCollection(): Promise<Collection<DbTag>> {
  const db = await getDb();
  return db.collection<DbTag>('tags');
}

export async function listByUser(userId: ObjectId): Promise<DbTag[]> {
  const col = await getCollection();
  return col.find({ userId }).sort({ createdAt: 1 }).toArray();
}

export async function findByIdForUser(id: ObjectId, userId: ObjectId): Promise<DbTag | null> {
  const col = await getCollection();
  return col.findOne({ _id: id, userId });
}

export async function create(
  userId: ObjectId,
  data: Omit<DbTag, '_id' | 'userId' | 'createdAt'>,
): Promise<DbTag> {
  const col = await getCollection();
  const doc: Omit<DbTag, '_id'> = { userId, ...data, createdAt: new Date() };
  const result = await col.insertOne(doc as DbTag);
  return { ...doc, _id: result.insertedId } as DbTag;
}

export async function update(
  id: ObjectId,
  userId: ObjectId,
  patch: Partial<Omit<DbTag, '_id' | 'userId' | 'createdAt'>>,
): Promise<DbTag | null> {
  const col = await getCollection();
  return col.findOneAndUpdate(
    { _id: id, userId },
    buildMongoUpdate(patch as Record<string, unknown>),
    { returnDocument: 'after' },
  );
}

export async function remove(id: ObjectId, userId: ObjectId): Promise<boolean> {
  const col = await getCollection();
  const result = await col.deleteOne({ _id: id, userId });
  return result.deletedCount > 0;
}
