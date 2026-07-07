import { createTagSchema, updateTagSchema } from '@contas/shared';
import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { parseId } from '../lib/parse-id';
import { requireAuth } from '../middleware/requireAuth';
import { validateBody } from '../middleware/validate';
import { removeTagFromAllBills } from '../repos/bills';
import * as tagsRepo from '../repos/tags';

const router = Router();

// GET /api/tags — list the authenticated user's tags
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const userId = new ObjectId(req.user!.id);
    const tags = await tagsRepo.listByUser(userId);
    res.json({ tags });
  } catch (err) {
    next(err);
  }
});

// POST /api/tags — create a new tag
router.post('/', requireAuth, validateBody(createTagSchema), async (req, res, next) => {
  try {
    const userId = new ObjectId(req.user!.id);
    const { name, color } = req.body as { name: string; color: string };

    const tag = await tagsRepo.create(userId, { name, color });
    res.status(201).json({ tag });
  } catch (err: unknown) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code: number }).code === 11000
    ) {
      res.status(409).json({ error: 'A tag with this name already exists' });
      return;
    }
    next(err);
  }
});

// PUT /api/tags/:id — update a tag
router.put('/:id', requireAuth, validateBody(updateTagSchema), async (req, res, next) => {
  try {
    const userId = new ObjectId(req.user!.id);
    const id = parseId(req.params.id as string);
    if (!id) {
      res.status(400).json({ error: 'Invalid ID' });
      return;
    }

    const tag = await tagsRepo.update(id, userId, req.body as Record<string, unknown>);
    if (!tag) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    res.json({ tag });
  } catch (err: unknown) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code: number }).code === 11000
    ) {
      res.status(409).json({ error: 'A tag with this name already exists' });
      return;
    }
    next(err);
  }
});

// DELETE /api/tags/:id — delete a tag and unassign it from all bills
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const userId = new ObjectId(req.user!.id);
    const id = parseId(req.params.id as string);
    if (!id) {
      res.status(400).json({ error: 'Invalid ID' });
      return;
    }

    const tag = await tagsRepo.findByIdForUser(id, userId);
    if (!tag) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    await tagsRepo.remove(id, userId);
    await removeTagFromAllBills(userId, id);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
