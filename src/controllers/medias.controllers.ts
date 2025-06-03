import { NextFunction, Request, Response } from "express"
import path from "path";
import { UPLOAD_VIDEO_DIR } from "~/constants/dir";
import httpStatus from "~/constants/httpStatus";
import { USER_MESSAGE } from "~/constants/messages";
import mediaService from "~/services/media.services";
import fs from 'fs'
import mime from 'mime'

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

export const serveVideoController = async (req: Request, res: Response, next: NextFunction) => {
  const range = req.headers.range;
  if(!range){
    return res.status(httpStatus.BAD_REQUEST).send('Requires Range header')
  }
  const {name} = req.params
  const videoPath = path.resolve(UPLOAD_VIDEO_DIR, name)

  //Dung lượng video
  const videoSize = fs.statSync(videoPath).size
  // Dung lượng video cho mỗi phân đoạn stream
  const chunkSize = 10 ** 6 // 1MB
  //Lấy giá trị byte bắt đầu từ Header Range
  const start = Number(range.replace(/\D/g, ''))
  // Lấy giá trị byte kết thúc, vượt quá dung lượng thì lấy videoSize
  const end = Math.min(start + chunkSize, videoSize)

  // Dung lượng thực tế cho mỗi đoạn Stream, 
  // Thường đây sẽ là chunkSize, ngoại trừ đoạn cuối cùng
  const contentLength = end - start
  const contentType = mime.getType(videoPath) || 'video/*'
  const headers = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': contentType
  }
  res.writeHead(httpStatus.PARTIAL_CONTENT, headers)
  const videoStream = fs.createReadStream(videoPath, { start, end })
  videoStream.pipe(res)
}