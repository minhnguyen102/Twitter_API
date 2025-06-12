import { Router} from 'express'
import userRouter from './user.router';
import oauthRouter from './oauth.router';
import mediasRouter from './media.router';
import staticRouter from './static.router';
import tweetsRouter from './tweet.router';
import bookmarkRouter from './bookmark.router';
import searchRouter from './search.router';

const router = Router()

router.use("/", oauthRouter);
router.use("/users", userRouter);
router.use("/medias", mediasRouter);
router.use("/uploads", staticRouter);
router.use("/tweets", tweetsRouter);
router.use("/bookmarks", bookmarkRouter);
router.use("/search", searchRouter);

export default router;
