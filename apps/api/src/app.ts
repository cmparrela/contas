import { clerkMiddleware } from '@clerk/express';
import cors from 'cors';
import express from 'express';
import billsRouter from './routes/bills';
import connectionsRouter from './routes/connections';
import monthsRouter from './routes/months';

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
    credentials: true,
  }),
);
app.use(express.json());
app.use(clerkMiddleware());

app.use((req, _res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    time: new Date().toISOString(),
  });
});

app.use('/api/bills', billsRouter);
app.use('/api/months', monthsRouter);
app.use('/api/connections', connectionsRouter);

// Generic error handler
app.use(
  (err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  },
);

export default app;
