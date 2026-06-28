declare global {
  namespace Express {
    interface Request {
      user?: { id: string; clerkUserId: string; email?: string };
    }
  }
}

export {};
