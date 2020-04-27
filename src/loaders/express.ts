import bodyParser from 'body-parser';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import routes from '../api';

export default async ({ app }: { app: express.Application }) => {
  app.get('/status', (_, res) => res.status(200).end());
  app.head('/status', (_, res) => res.status(200).end());

  app.enable('trust proxy');

  app.use(cors());
  app.use(compression());
  app.use(bodyParser.json());
  app.use(routes());

  return app;
};
