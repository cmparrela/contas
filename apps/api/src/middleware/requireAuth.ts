import { clerkClient, getAuth } from '@clerk/express';
import type { RequestHandler } from 'express';
import { upsertByClerkUserId } from '../repos/users';

export const requireAuth: RequestHandler = async (req, res, next) => {
  const { userId } = getAuth(req);

  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const clerkUser = await clerkClient.users.getUser(userId);
    const email = clerkUser.emailAddresses[0]?.emailAddress;

    const dbUser = await upsertByClerkUserId(userId, { email });
    req.user = {
      id: dbUser._id.toHexString(),
      clerkUserId: dbUser.clerkUserId,
      email: dbUser.email,
    };
    next();
  } catch (err) {
    next(err);
  }
};
