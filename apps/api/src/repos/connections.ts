import type { Collection, ObjectId } from 'mongodb';
import { getDb } from '../db/mongo';

export type ConnectionStatus = 'pending' | 'accepted' | 'rejected';

export interface DbConnection {
  _id: ObjectId;
  fromUserId: ObjectId;
  toUserId: ObjectId;
  fromEmail: string;
  toEmail: string;
  status: ConnectionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export async function getCollection(): Promise<Collection<DbConnection>> {
  const db = await getDb();
  return db.collection<DbConnection>('connections');
}

export async function listAcceptedForUser(userId: ObjectId): Promise<DbConnection[]> {
  const col = await getCollection();
  return col
    .find({ status: 'accepted', $or: [{ fromUserId: userId }, { toUserId: userId }] })
    .toArray();
}

export async function listPendingForUser(userId: ObjectId): Promise<DbConnection[]> {
  const col = await getCollection();
  return col.find({ toUserId: userId, status: 'pending' }).toArray();
}

export async function listSentByUser(userId: ObjectId): Promise<DbConnection[]> {
  const col = await getCollection();
  return col.find({ fromUserId: userId, status: 'pending' }).toArray();
}

export async function findById(id: ObjectId): Promise<DbConnection | null> {
  const col = await getCollection();
  return col.findOne({ _id: id });
}

export async function findBetweenUsers(
  fromUserId: ObjectId,
  toUserId: ObjectId,
): Promise<DbConnection | null> {
  const col = await getCollection();
  return col.findOne({
    $or: [
      { fromUserId, toUserId },
      { fromUserId: toUserId, toUserId: fromUserId },
    ],
  });
}

export async function create(
  data: Omit<DbConnection, '_id' | 'createdAt' | 'updatedAt'>,
): Promise<DbConnection> {
  const col = await getCollection();
  const now = new Date();
  const doc: Omit<DbConnection, '_id'> = { ...data, createdAt: now, updatedAt: now };
  const result = await col.insertOne(doc as DbConnection);
  return { ...doc, _id: result.insertedId } as DbConnection;
}

export async function updateStatus(
  id: ObjectId,
  status: ConnectionStatus,
): Promise<DbConnection | null> {
  const col = await getCollection();
  return col.findOneAndUpdate(
    { _id: id },
    { $set: { status, updatedAt: new Date() } },
    { returnDocument: 'after' },
  );
}
