import express from 'express'
const app = express()
import router from './routes/index.router'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/errors.middleware'
import { initFolder } from './utils/file'
import {config} from 'dotenv'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from './constants/dir'
import { MongoClient } from 'mongodb'
import { random } from 'lodash'


config();
initFolder();

const port = process.env.PORT || 4000

databaseService.run().catch(console.dir).then(() => {
  databaseService.createIndexUser()
  databaseService.createIndexRefreshToken()
  databaseService.createIndexFollower()
});
app.use(express.json());
app.use(router);
app.use('/uploads', express.static(UPLOAD_IMAGE_DIR))
app.use('/uploads/video', express.static(UPLOAD_VIDEO_DIR))

app.use(defaultErrorHandler)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})