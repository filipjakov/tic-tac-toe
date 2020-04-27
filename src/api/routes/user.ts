import { Router, Response } from 'express';
import middlewares from '../middlewares';

const route = Router();

export default (app: Router) => {
  app.use('/users', route);

  route.get('/me', middlewares.isAuth, middlewares.attachUser, ({ currentUser }: any, res: Response) => {
    return res.json({ user: currentUser }).status(200);
  });
};
