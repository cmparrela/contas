import type { Collection, ObjectId } from 'mongodb';
import { getDb } from '../db/mongo';

export interface DbUser {
  _id: ObjectId;
  clerkUserId: string;
  email?: string;
  name?: string;
  createdAt: Date;
}

export async function getCollection(): Promise<Collection<DbUser>> {
  const db = await getDb();
  return db.collection<DbUser>('users');
}

export async function upsertByClerkUserId(
  clerkUserId: string,
  opts?: { email?: string; name?: string },
): Promise<DbUser> {
  const col = await getCollection();

  const setOnInsert: Partial<DbUser> = {
    clerkUserId,
    createdAt: new Date(),
  };

  const setFields: Partial<DbUser> = {};
  if (opts?.email !== undefined) setFields.email = opts.email;
  if (opts?.name !== undefined) setFields.name = opts.name;

  const update: Record<string, unknown> = { $setOnInsert: setOnInsert };
  if (Object.keys(setFields).length > 0) {
    update.$set = setFields;
  }

  try {
    const result = await col.findOneAndUpdate({ clerkUserId }, update, {
      upsert: true,
      returnDocument: 'after',
    });
    return result!;
  } catch (err: unknown) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code: number }).code === 11000
    ) {
      const existing = await col.findOne({ clerkUserId });
      return existing!;
    }
    throw err;
  }
}

export async function findByEmail(email: string): Promise<DbUser | null> {
  const col = await getCollection();
  return col.findOne({ email });
}

export async function findById(id: ObjectId): Promise<DbUser | null> {
  const col = await getCollection();
  return col.findOne({ _id: id });
}
