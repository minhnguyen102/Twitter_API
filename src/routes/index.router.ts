import { defaultErrorHandler } from '~/middlewares/errors.middleware';
import userRouter from './user.router';
import { Router, Request, Response, NextFunction } from 'express'

const router = Router()

router.use("/users", userRouter);

export default router;
