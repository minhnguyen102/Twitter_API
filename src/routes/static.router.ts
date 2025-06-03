import { Router } from 'express'
import { serveVideoController } from '~/controllers/medias.controllers';
import { wrapReqHandler } from '~/utils/handles';

const staticRouter = Router()
staticRouter.get("/video-stream/:name", wrapReqHandler(serveVideoController))

export default staticRouter;