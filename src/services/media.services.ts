import { Request } from "express"
import { getNameFromFullname, handlerUploadSingleImage } from "~/utils/file";
import sharp from "sharp";
import path from "path";
import { UPLOAD_DIR } from "~/constants/dir";
import fs from 'fs'
import { isProduction } from "~/utils/config";
import { config } from "dotenv";
config();

class MediaService{
  async handlerUploadSingleImage(req: Request){
    const data = await handlerUploadSingleImage(req as any)
    const newName = getNameFromFullname(data.newFilename);
    const newpath = path.resolve(UPLOAD_DIR, `${newName}.jpg`)
    await sharp(data.filepath).jpeg().toFile(newpath)
    // fs.unlinkSync(data.filepath) // Lỗi // Sau sẽ xử lí đẩy lên cloud
    console.log(data.filepath)
    return isProduction?  
      `${process.env.HOST}//uploads/${newName}.jpg` : 
      `http://localhost:${process.env.PORT}/uploads/${newName}.jpg`
  }
}

const mediaService = new MediaService

export default mediaService