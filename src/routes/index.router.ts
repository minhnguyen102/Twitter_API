import userRouter from './user.router';
import { Router} from 'express'
import oauthRouter from './oauth.router';

const router = Router()

router.use("/users", userRouter);
router.use("/", oauthRouter);

export default router;
