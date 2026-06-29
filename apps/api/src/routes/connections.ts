import { inviteConnectionSchema } from '@contas/shared';
import type { RequestHandler } from 'express';
import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { parseId } from '../lib/parse-id';
import { requireAuth } from '../middleware/requireAuth';
import { validateBody } from '../middleware/validate';
import * as connectionsRepo from '../repos/connections';
import { findByEmail } from '../repos/users';

const router = Router();

// GET /api/connections — list user's connections
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const userId = new ObjectId(req.user!.id);
    const accepted = await connectionsRepo.listAcceptedForUser(userId);
    const pending = await connectionsRepo.listPendingForUser(userId);
    const sent = await connectionsRepo.listSentByUser(userId);
    res.json({ accepted, pending, sent });
  } catch (err) {
    next(err);
  }
});

// POST /api/connections/invite — invite user by email
router.post(
  '/invite',
  requireAuth,
  validateBody(inviteConnectionSchema),
  async (req, res, next) => {
    try {
      const fromUserId = new ObjectId(req.user!.id);
      const fromEmail = req.user!.email ?? '';
      const { email: toEmail } = req.body as { email: string };

      if (toEmail.toLowerCase() === fromEmail.toLowerCase()) {
        res.status(400).json({ error: 'Cannot invite yourself' });
        return;
      }

      const toUser = await findByEmail(toEmail);
      if (!toUser) {
        res.status(404).json({ error: 'User not found. They need to sign up first.' });
        return;
      }

      const existing = await connectionsRepo.findBetweenUsers(fromUserId, toUser._id);
      if (existing) {
        res.status(409).json({ error: 'Connection already exists', connection: existing });
        return;
      }

      const connection = await connectionsRepo.create({
        fromUserId,
        toUserId: toUser._id,
        fromEmail,
        toEmail: toUser.email ?? toEmail,
        status: 'pending',
      });

      res.status(201).json({ connection });
    } catch (err) {
      next(err);
    }
  },
);

function makeStatusHandler(targetStatus: 'accepted' | 'rejected'): RequestHandler {
  return async (req, res, next) => {
    try {
      const userId = new ObjectId(req.user!.id);
      const id = parseId(req.params.id as string);
      if (!id) {
        res.status(404).json({ error: 'Not found' });
        return;
      }

      const connection = await connectionsRepo.findById(id);
      if (!connection) {
        res.status(404).json({ error: 'Not found' });
        return;
      }

      if (!connection.toUserId.equals(userId)) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }

      if (connection.status !== 'pending') {
        res.status(400).json({ error: `Connection is already ${connection.status}` });
        return;
      }

      const updated = await connectionsRepo.updateStatus(id, targetStatus);
      res.json({ connection: updated });
    } catch (err) {
      next(err);
    }
  };
}

router.put('/:id/accept', requireAuth, makeStatusHandler('accepted'));
router.put('/:id/reject', requireAuth, makeStatusHandler('rejected'));

export default router;
