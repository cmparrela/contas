import app from './app';
import { ensureAllIndexes } from './db/indexes';

const port = process.env.PORT ?? '3333';

ensureAllIndexes()
  .then(() => {
    app.listen(Number(port), () => {
      console.log(`API running at http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error('Failed to ensure indexes:', err);
    process.exit(1);
  });
