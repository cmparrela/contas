import { getDb } from './mongo';

export async function ensureAllIndexes(): Promise<void> {
  const db = await getDb();

  // users
  await db
    .collection('users')
    .createIndex({ clerkUserId: 1 }, { unique: true, name: 'idx_users_clerkUserId' });
  await db
    .collection('users')
    .createIndex({ email: 1 }, { name: 'idx_users_email' });

  // bills
  await db
    .collection('bills')
    .createIndex({ userId: 1, active: 1, order: 1 }, { name: 'idx_bills_userId_active_order' });

  // monthlyBills
  await db
    .collection('monthlyBills')
    .createIndex(
      { userId: 1, year: 1, month: 1 },
      { name: 'idx_monthlyBills_userId_year_month' },
    );
  await db
    .collection('monthlyBills')
    .createIndex(
      { billId: 1, year: 1, month: 1, userId: 1 },
      { unique: true, name: 'idx_monthlyBills_billId_year_month_userId' },
    );

  // connections
  await db
    .collection('connections')
    .createIndex({ fromUserId: 1, status: 1 }, { name: 'idx_connections_fromUserId_status' });
  await db
    .collection('connections')
    .createIndex({ toUserId: 1, status: 1 }, { name: 'idx_connections_toUserId_status' });
  await db
    .collection('connections')
    .createIndex(
      { fromUserId: 1, toUserId: 1 },
      { unique: true, name: 'idx_connections_fromTo' },
    );
}
