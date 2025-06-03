import { Router } from 'express'
import { uploadImageController, uploadVideoController } from '~/controllers/medias.controllers';
import { wrapReqHandler } from '~/utils/handles';

const meidasRouter = Router()
meidasRouter.post("/upload-image", wrapReqHandler(uploadImageController))
meidasRouter.post("/upload-video", wrapReqHandler(uploadVideoController))

export default meidasRouter;