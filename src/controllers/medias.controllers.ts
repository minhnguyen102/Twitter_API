import { NextFunction, Request, Response } from "express"
import path from "path";
import mediaService from "~/services/media.services";
import { handlerUploadSingleImage } from "~/utils/file";

// [POST] /medias/uploadSingleFile
export const uploadSingleImageController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await mediaService.handlerUploadSingleImage(req)
  // console.log(result)
  res.json({
    result: result
  })
}