import { Response, Router } from 'express';
import { isAuth, attachUser } from '../middlewares';

const route = Router();

export default (app: Router) => {
  app.use('/users', route);

  route.get('/me', isAuth, attachUser, ({ currentUser }: any, res: Response) => {
    return res.json({ user: currentUser }).status(200);
  });
};
