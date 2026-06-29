import { clerkClient, getAuth } from '@clerk/express';
import type { RequestHandler } from 'express';
import type { DbUser } from '../repos/users';
import { upsertByClerkUserId } from '../repos/users';

const USER_CACHE_TTL = 5 * 60 * 1000;
const userCache = new Map<string, { user: DbUser; expiresAt: number }>();

export const requireAuth: RequestHandler = async (req, res, next) => {
  const { userId } = getAuth(req);

  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const cached = userCache.get(userId);
    if (cached && cached.expiresAt > Date.now()) {
      req.user = {
        id: cached.user._id.toHexString(),
        clerkUserId: cached.user.clerkUserId,
        email: cached.user.email,
      };
      return next();
    }

    const clerkUser = await clerkClient.users.getUser(userId);
    const email = clerkUser.emailAddresses[0]?.emailAddress;
    const dbUser = await upsertByClerkUserId(userId, { email });

    userCache.set(userId, { user: dbUser, expiresAt: Date.now() + USER_CACHE_TTL });

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
