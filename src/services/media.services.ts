import { Request } from "express"
import { getNameFromFullname, handlerUploadImage, handlerUploadVideo } from "~/utils/file";
import sharp from "sharp";
import path from "path";
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from "~/constants/dir";
import { isProduction } from "~/utils/config";
import { config } from "dotenv";
import { MediaType } from "~/constants/enums";
import { Meida } from "~/models/Others";
config();

class MediaService{
  async handlerUploadImage(req: Request){
    const files = await handlerUploadImage(req as any)
    const result: Meida[] = await Promise.all(files.map( async file => {
      const newName = getNameFromFullname(file.newFilename);
      const newpath = path.resolve(UPLOAD_IMAGE_DIR, `${newName}.jpg`)
      await sharp(file.filepath).jpeg().toFile(newpath)
      // fs.unlinkSync(file.filepath) // Lỗi // Sau sẽ xử lí đẩy lên cloud
      return {
        url: isProduction?  
        `${process.env.HOST}//uploads/${newName}.jpg` : 
        `http://localhost:${process.env.PORT}/uploads/${newName}.jpg`,
        type: MediaType.Image
      }
    }))
    return result
  }

  async handlerUploadVideo(req: Request){
    const files = await handlerUploadVideo(req as any)
    const { newFilename } = files[0]
    return {
      url: isProduction?  
      `${process.env.HOST}//uploads/video/${newFilename}` : 
      `http://localhost:${process.env.PORT}/uploads/video/${newFilename}`,
      type: MediaType.Video
    }
  }
}

const mediaService = new MediaService

export default mediaService