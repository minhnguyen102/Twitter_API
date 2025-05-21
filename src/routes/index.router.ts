import { defaultErrorHandler } from '~/middlewares/errors.middleware';
import userRouter from './user.router';
import { Router, Request, Response, NextFunction } from 'express'

const router = Router()

router.use("/users", userRouter);


// error handle cho cả app: Luôn phải để sau cùng
// router.use(defaultErrorHandler)

export default router;
