import { type Db, MongoClient } from 'mongodb';

let client: MongoClient | undefined;
let db: Db | undefined;

export async function getDb(): Promise<Db> {
  if (db) return db;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI environment variable is required');

  const dbName = process.env.MONGODB_DB ?? 'contas';

  client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);
  return db;
}
