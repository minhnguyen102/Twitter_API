import { Router } from 'express'
import { uploadImageController, uploadVideoController } from '~/controllers/medias.controllers';
import { wrapReqHandler } from '~/utils/handles';

const mediasRouter = Router()
mediasRouter.post("/upload-image", wrapReqHandler(uploadImageController))
mediasRouter.post("/upload-video", wrapReqHandler(uploadVideoController))

export default mediasRouter;