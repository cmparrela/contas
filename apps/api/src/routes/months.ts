import { updateMonthlyBillSchema } from '@contas/shared';
import type { RequestHandler } from 'express';
import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { parseId } from '../lib/parse-id';
import { requireAuth } from '../middleware/requireAuth';
import { validateBody } from '../middleware/validate';
import * as billsRepo from '../repos/bills';
import * as monthsRepo from '../repos/months';
import type { DbMonthlyBill } from '../repos/months';

const router = Router();

async function ensureMonthInitialized(
  userId: ObjectId,
  year: number,
  month: number,
): Promise<DbMonthlyBill[]> {
  const existing = await monthsRepo.listByUserAndMonth(userId, year, month);
  if (existing.length > 0) return existing;

  const activeBills = await billsRepo.listActiveByUser(userId);
  if (activeBills.length === 0) return [];

  const docs: Parameters<typeof monthsRepo.insertMany>[0] = activeBills.map((bill) => {
    const base = {
      billId: bill._id,
      userId,
      year,
      month,
      amount: bill.amount,
    };

    if (!bill.isShared) return base;

    let otherAmount: number;
    if (bill.splitType === 'custom' && bill.customSplitAmount !== undefined) {
      otherAmount = bill.customSplitAmount;
    } else {
      otherAmount = bill.amount !== undefined ? bill.amount / 2 : 0;
    }

    return {
      ...base,
      sharedData: {
        otherUserId: bill.sharedWithUserId!,
        otherAmount,
      },
    };
  });

  return monthsRepo.insertMany(docs);
}

function makeSharedHandler(
  repoMethod: (
    billId: ObjectId,
    userId: ObjectId,
    year: number,
    month: number,
  ) => Promise<DbMonthlyBill | null>,
): RequestHandler {
  return async (req, res, next) => {
    try {
      const userId = new ObjectId(req.user!.id);
      const year = parseInt(req.params.year as string, 10);
      const month = parseInt(req.params.month as string, 10);
      const billId = parseId(req.params.billId as string);

      if (!billId || isNaN(year) || isNaN(month)) {
        res.status(400).json({ error: 'Invalid parameters' });
        return;
      }

      const updated = await repoMethod(billId, userId, year, month);
      if (!updated) {
        res.status(404).json({ error: 'Not found' });
        return;
      }

      res.json({ monthlyBill: updated });
    } catch (err) {
      next(err);
    }
  };
}

// GET /api/months/:year/:month
router.get('/:year/:month', requireAuth, async (req, res, next) => {
  try {
    const userId = new ObjectId(req.user!.id);
    const year = parseInt(req.params.year as string, 10);
    const month = parseInt(req.params.month as string, 10);

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      res.status(400).json({ error: 'Invalid year or month' });
      return;
    }

    const monthlyBills = await ensureMonthInitialized(userId, year, month);

    // Join with bill data using a single $in query
    const uniqueBillIds = [
      ...new Set(monthlyBills.map((mb) => mb.billId.toHexString())),
    ].map((id) => new ObjectId(id));
    const bills = await billsRepo.findByIds(uniqueBillIds);
    const billMap = new Map(bills.map((b) => [b._id.toHexString(), b]));

    const result = monthlyBills.map((mb) => ({
      ...mb,
      bill: billMap.get(mb.billId.toHexString()),
    }));

    res.json({ monthlyBills: result, year, month });
  } catch (err) {
    next(err);
  }
});

// PUT /api/months/:year/:month/:billId — update a monthly bill instance
router.put(
  '/:year/:month/:billId',
  requireAuth,
  validateBody(updateMonthlyBillSchema),
  async (req, res, next) => {
    try {
      const userId = new ObjectId(req.user!.id);
      const year = parseInt(req.params.year as string, 10);
      const month = parseInt(req.params.month as string, 10);
      const billId = parseId(req.params.billId as string);

      if (!billId || isNaN(year) || isNaN(month)) {
        res.status(400).json({ error: 'Invalid parameters' });
        return;
      }

      const existing = await monthsRepo.findByBillAndMonth(billId, userId, year, month);
      if (!existing) {
        res.status(404).json({ error: 'Not found' });
        return;
      }

      const { amount, paid } = req.body as { amount?: number | null; paid?: boolean };

      const patch: Parameters<typeof monthsRepo.update>[2] = {};
      if (amount !== undefined) patch.amount = amount ?? undefined;
      if (paid !== undefined) patch.paidAt = paid ? new Date() : undefined;

      const updated = await monthsRepo.update(existing._id, userId, patch);
      res.json({ monthlyBill: updated });
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  '/:year/:month/:billId/shared-paid',
  requireAuth,
  makeSharedHandler(monthsRepo.updateSharedPaid),
);

router.post(
  '/:year/:month/:billId/shared-confirm',
  requireAuth,
  makeSharedHandler(monthsRepo.updateSharedConfirm),
);

export default router;
