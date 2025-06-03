import { File } from 'formidable'
import fs from 'fs'
import { UPLOAD_TEMP_DIR } from '~/constants/dir'

export const initFolder = () =>{
  if(!fs.existsSync(UPLOAD_TEMP_DIR)){
    // tạo mới folder
    fs.mkdirSync(UPLOAD_TEMP_DIR, {
      recursive: true // cho phép nested
    })
  }
}

export const handlerUploadImage = async (req: Request) => {
  const formidable = (await (import('formidable'))).default // Cách import 1 file esmodule vào dự án common js
  const form = formidable({
    uploadDir: UPLOAD_TEMP_DIR,
    keepExtensions: true,
    maxFiles: 4,
    maxFileSize: 300 * 1024 * 1024, // 300MB,
    maxTotalFileSize : 300 * 1024 * 1024 * 4,
    filter: function({name, originalFilename, mimetype}){
      const valid = name ==="image" && Boolean(mimetype?.includes('image/'))
      if(!valid){
        form.emit('error' as any, new Error('Invalid type') as any)
      }
      return valid
    }
  });
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req as any, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      if(!Boolean(files.image)){
        return reject(new Error("File is empty"))
      }
      resolve((files.image as File[]))
    });
  })
}

export const getNameFromFullname = (fullname: string) => {
  const namearr = fullname.split(".")
  namearr.pop()
  return namearr.join('')
}