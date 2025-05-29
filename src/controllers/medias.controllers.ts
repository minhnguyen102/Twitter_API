import { NextFunction, Request, Response } from "express"
import path from "path";

// [POST] /medias/uploadSingleFile
export const uploadSingleImageController = async (req: Request, res: Response, next: NextFunction) => {
  const formidable = (await (import('formidable'))).default // Cách import 1 file esmodule vào dự án common js
  const form = formidable({
    uploadDir: path.resolve('uploads'),
    keepExtensions: true,
    maxFiles: 1,
    maxFileSize: 3000 * 1024 * 1024 // 300MB
  });
  form.parse(req, (err, fields, files) => {
    if (err) {
      throw err
    }
    res.json({
      message: "Upload file successfully",
      fields, files 
    });
  });
}