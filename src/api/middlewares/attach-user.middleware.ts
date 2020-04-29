import { Container } from 'typedi';
import { Request, Response, NextFunction } from 'express';
import PlayerService from '../../services/player.service';

const attachUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await Container.get(PlayerService).find((req as any)['token._id'] as number);

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
