import { Router} from 'express'
import userRouter from './user.router';
import oauthRouter from './oauth.router';
import meidasRouter from './media.router';
import staticRouter from './static.router';

const router = Router()

router.use("/", oauthRouter);
router.use("/users", userRouter);
router.use("/medias", meidasRouter);
router.use("/uploads", staticRouter);

export default router;
