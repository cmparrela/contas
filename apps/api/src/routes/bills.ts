import { createBillSchema, updateBillSchema } from '@contas/shared';
import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { requireAuth } from '../middleware/requireAuth';
import { validateBody } from '../middleware/validate';
import * as billsRepo from '../repos/bills';

const router = Router();

function parseId(param: string): ObjectId | null {
  try {
    return new ObjectId(param);
  } catch {
    return null;
  }
}

// GET /api/bills — list active bills for the authenticated user
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const userId = new ObjectId(req.user!.id);
    const bills = await billsRepo.listActiveByUser(userId);
    res.json({ bills });
  } catch (err) {
    next(err);
  }
});

// POST /api/bills — create a new bill
router.post('/', requireAuth, validateBody(createBillSchema), async (req, res, next) => {
  try {
    const userId = new ObjectId(req.user!.id);
    const body = req.body as {
      name: string;
      amount?: number;
      where?: string;
      notes?: string;
      isShared: boolean;
      sharedWithUserId?: string;
      splitType?: 'half' | 'custom';
      customSplitAmount?: number;
      payerUserId?: string;
      order: number;
    };

    const bill = await billsRepo.create(userId, {
      name: body.name,
      amount: body.amount,
      where: body.where,
      notes: body.notes,
      isShared: body.isShared,
      sharedWithUserId: body.sharedWithUserId ? new ObjectId(body.sharedWithUserId) : undefined,
      splitType: body.splitType,
      customSplitAmount: body.customSplitAmount,
      payerUserId: body.payerUserId ? new ObjectId(body.payerUserId) : undefined,
      active: true,
      order: body.order,
    });

    res.status(201).json({ bill });
  } catch (err) {
    next(err);
  }
});

// PUT /api/bills/:id — update a bill
router.put('/:id', requireAuth, validateBody(updateBillSchema), async (req, res, next) => {
  try {
    const userId = new ObjectId(req.user!.id);
    const id = parseId(req.params.id as string);
    if (!id) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    const body = req.body as Record<string, unknown>;

    // Convert string IDs to ObjectIds
    const patch: Record<string, unknown> = { ...body };
    if (typeof patch.sharedWithUserId === 'string') {
      patch.sharedWithUserId = new ObjectId(patch.sharedWithUserId as string);
    }
    if (typeof patch.payerUserId === 'string') {
      patch.payerUserId = new ObjectId(patch.payerUserId as string);
    }

    const bill = await billsRepo.update(id, userId, patch);
    if (!bill) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    res.json({ bill });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/bills/:id — soft delete (active: false)
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const userId = new ObjectId(req.user!.id);
    const id = parseId(req.params.id as string);
    if (!id) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    const bill = await billsRepo.softDelete(id, userId);
    if (!bill) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
