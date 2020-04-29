import { NextFunction, Response } from 'express';
import { Container } from 'typedi';
import Logger from '../../loaders/logger';
import PlayerService from '../../services/player.service';

const attachUser = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user = await Container.get(PlayerService).find(req['token._id'] as number);

    if (!user) {
      return res.sendStatus(401);
    }

    req.currentUser = user;
    return next();
  } catch (e) {
    Logger.error('Cannot attach user to request.');
    return next(e); 
  }
};

export default attachUser;
