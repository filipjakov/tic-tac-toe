import { Container } from 'typedi';
import { Request, Response, NextFunction } from 'express';
import UserService from '../../services/user.service';

const attachUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userService = Container.get(UserService);
    const user = await userService.find((req as any)['token._id'] as string);

    if (!user) {
      return res.sendStatus(401);
    }

    (req as any).currentUser = user;
    return next();
  } catch (e) {
    console.error(e);
    return next(e); 
  }
};

export default attachUser;
