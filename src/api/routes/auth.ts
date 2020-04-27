import { Router, Request, Response, NextFunction } from "express";
import { celebrate, Joi } from 'celebrate';
import { Container } from "typedi";
import AuthService from "../../services/auth.service";

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
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const authService = Container.get(AuthService);
        const { user, token } = await authService.signUp({ name: req.body.name });
        return res.status(201).json({ name: user.name, token });
      } catch (e) {
        console.error(e);
        return next(e);
      }
    }
  );
}
