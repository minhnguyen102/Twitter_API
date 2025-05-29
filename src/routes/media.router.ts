import { Router } from 'express'
import { uploadSingleImageController } from '~/controllers/medias.controllers';
import { wrapReqHandler } from '~/utils/handles';

const meidasRouter = Router()
meidasRouter.post("/upload-image", wrapReqHandler(uploadSingleImageController))

export default meidasRouter;