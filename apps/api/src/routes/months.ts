import { updateMonthlyBillSchema } from '@contas/shared';
import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { requireAuth } from '../middleware/requireAuth';
import { validateBody } from '../middleware/validate';
import * as billsRepo from '../repos/bills';
import * as monthsRepo from '../repos/months';

const router = Router();

function parseId(param: string): ObjectId | null {
  try {
    return new ObjectId(param);
  } catch {
    return null;
  }
}

/**
 * Auto-creates MonthlyBill documents from all active bills if this is the
 * first access for the given month/year. This replaces the manual "reset"
 * the user did in their old spreadsheet.
 */
async function ensureMonthInitialized(
  userId: ObjectId,
  year: number,
  month: number,
): Promise<void> {
  const existing = await monthsRepo.listByUserAndMonth(userId, year, month);
  if (existing.length > 0) return;

  // First access: create instances from all active bills
  const activeBills = await billsRepo.listActiveByUser(userId);
  if (activeBills.length === 0) return;

  const docs: Parameters<typeof monthsRepo.insertMany>[0] = activeBills.map((bill) => {
    const base = {
      billId: bill._id,
      userId,
      year,
      month,
      amount: bill.amount, // carry over fixed amount; variable bills leave it undefined
    };

    if (!bill.isShared) return base;

    // For shared bills, calculate split amounts
    const otherAmount =
      bill.splitType === 'custom' && bill.customSplitAmount !== undefined
        ? bill.customSplitAmount
        : bill.amount !== undefined
          ? bill.amount / 2
          : 0;

    return {
      ...base,
      sharedData: {
        otherUserId: bill.sharedWithUserId!,
        otherAmount,
      },
    };
  });

  await monthsRepo.insertMany(docs);
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

    await ensureMonthInitialized(userId, year, month);

    const monthlyBills = await monthsRepo.listByUserAndMonth(userId, year, month);

    // Join with bill data
    const billIds = [...new Set(monthlyBills.map((mb) => mb.billId.toHexString()))];
    const bills = await Promise.all(billIds.map((id) => billsRepo.findById(new ObjectId(id))));
    const billMap = new Map(bills.filter(Boolean).map((b) => [b!._id.toHexString(), b!]));

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
        res.status(404).json({ error: 'Not found' });
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

// POST /api/months/:year/:month/:billId/shared-paid — other user marks their portion as paid
router.post('/:year/:month/:billId/shared-paid', requireAuth, async (req, res, next) => {
  try {
    const userId = new ObjectId(req.user!.id);
    const year = parseInt(req.params.year as string, 10);
    const month = parseInt(req.params.month as string, 10);
    const billId = parseId(req.params.billId as string);

    if (!billId || isNaN(year) || isNaN(month)) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    const updated = await monthsRepo.updateSharedPaid(billId, userId, year, month);
    if (!updated) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    res.json({ monthlyBill: updated });
  } catch (err) {
    next(err);
  }
});

// POST /api/months/:year/:month/:billId/shared-confirm — payer confirms receiving the PIX
router.post('/:year/:month/:billId/shared-confirm', requireAuth, async (req, res, next) => {
  try {
    const userId = new ObjectId(req.user!.id);
    const year = parseInt(req.params.year as string, 10);
    const month = parseInt(req.params.month as string, 10);
    const billId = parseId(req.params.billId as string);

    if (!billId || isNaN(year) || isNaN(month)) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    const updated = await monthsRepo.updateSharedConfirm(billId, userId, year, month);
    if (!updated) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    res.json({ monthlyBill: updated });
  } catch (err) {
    next(err);
  }
});

export default router;
