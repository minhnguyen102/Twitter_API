import fs from 'fs'
import path from 'path'
export const initFolder = () =>{
  const uploadFolderPath = path.resolve('uploads')
  if(!fs.existsSync(uploadFolderPath)){
    // tạo mới folder
    fs.mkdirSync(uploadFolderPath, {
      recursive: true // cho phép nested
    })
  }
}