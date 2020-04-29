import { celebrate, Joi } from 'celebrate';
import { NextFunction, Request, Response, Router } from "express";
import { Container } from "typedi";
import Logger from "../../loaders/logger";
import { AuthService } from "../../services/auth.service";

const route = Router();

export default (app: Router) => {
  app.use('/auth', route);

  route.post(
    '/signup',
    celebrate({
      body: Joi.object({
        name: Joi.string().min(3).max(100).required(),
      }),
    }),
    async ({ body }: Request, res: Response, next: NextFunction) => {
      try {
        const { player, token } = await Container.get(AuthService).signUp({ name: body.name });
        return res.status(201).json({ name: player.name, token });
      } catch (e) {
        Logger.error('Something went wrong while signing-up user!');
        return next(e);
      }
    }
  );
}
