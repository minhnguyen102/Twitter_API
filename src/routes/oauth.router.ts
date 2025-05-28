import { Router } from 'express'
import { oauthController } from '~/controllers/users.controllers';
import { wrapReqHandler } from '~/utils/handles';

const oauthRouter = Router()
oauthRouter.get("/api/oauth/google", wrapReqHandler(oauthController))

export default oauthRouter;