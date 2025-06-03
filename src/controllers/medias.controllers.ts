import { NextFunction, Request, Response } from "express"
import path from "path";
import mediaService from "~/services/media.services";

// [POST] /medias/uploadSingleFile
export const uploadSingleImageController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await mediaService.handlerUploadImage(req)
  res.json({
    result: result
  })
}