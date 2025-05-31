import { NextFunction, Request, Response } from "express"
import path from "path";
import { handlerUploadSingleImage } from "~/utils/file";

// [POST] /medias/uploadSingleFile
export const uploadSingleImageController = async (req: Request, res: Response, next: NextFunction) => {
  const data = await handlerUploadSingleImage(req as any)
  res.json({
    data: data
  })
}