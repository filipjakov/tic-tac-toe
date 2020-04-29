import "reflect-metadata";
import express from 'express';

async function startServer(): Promise<void> {
  const app = express();

  await require('./loaders').default({ app });

  // Fallback to a 404
  app.use((_, __, next) => {
    const err = new Error('Not Found');
    (err as any).status = 404;
    next(err);
  });

  app.use((err: any, _: any, res: any) => {
    /**
     * Handle 401 thrown by express-jwt library
     */
    if (err.name === 'UnauthorizedError') {
      return res
        .status(err.status)
        .send({ message: err.message })
        .end();
    }

    res.status(err.status || 500);
    return res.json({
      errors: {
        message: err.message,
      },
    });
  });
}

startServer();

