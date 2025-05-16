import userRouter from './user.router';
import { Router, Request, Response, NextFunction } from 'express'

const router = Router()

router.use("/users", userRouter);


// error handle cho cả app: Luôn phải để sau cùng
router.use((error: any, req: Request, res: Response, next: NextFunction) =>{
  res.status(400).json({
    error : error.message
  })
})

export default router;
