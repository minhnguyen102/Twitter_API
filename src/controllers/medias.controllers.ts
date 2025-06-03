import { NextFunction, Request, Response } from "express"
import { USER_MESSAGE } from "~/constants/messages";
import mediaService from "~/services/media.services";

// [POST] /medias/upload-image
export const uploadImageController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await mediaService.handlerUploadImage(req)
  res.json({
    message: USER_MESSAGE.UPLOAD_IMAGE_SUCCESSFULLY,
    result: result
  })
}

// [POST] /medias/upload-video
export const uploadVideoController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await mediaService.handlerUploadVideo(req)
  res.json({
    message: USER_MESSAGE.UPLOAD_VIDEO_SUCCESSFULLY,
    result: result
  })
}