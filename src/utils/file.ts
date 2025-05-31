import { error } from 'console'
import fs from 'fs'
import path, { resolve } from 'path'

export const initFolder = () =>{
  const uploadFolderPath = path.resolve('uploads')
  if(!fs.existsSync(uploadFolderPath)){
    // tạo mới folder
    fs.mkdirSync(uploadFolderPath, {
      recursive: true // cho phép nested
    })
  }
}

export const handlerUploadSingleImage = async (req: Request) => {
  const formidable = (await (import('formidable'))).default // Cách import 1 file esmodule vào dự án common js
  const form = formidable({
    uploadDir: path.resolve('uploads'),
    keepExtensions: true,
    maxFiles: 1,
    maxFileSize: 300 * 1024 * 1024, // 300MB,
    filter: function({name, originalFilename, mimetype}){
      const valid = name ==="image" && Boolean(mimetype?.includes('image/'))
      if(!valid){
        form.emit('error' as any, new Error('Invalid type') as any)
      }
      return valid
    }
  });
  return new Promise((resolve, reject) => {
    form.parse(req as any, (err, fields, files) => {
      // console.log("files", files)
      // console.log("fields", fields)
      // console.log('error:', Boolean(err))
      if (err) {
        return reject(err)
      }
      if(!Boolean(files.image)){
        return reject(new Error("File is empty"))
      }
      resolve(files)
    });
  })
}