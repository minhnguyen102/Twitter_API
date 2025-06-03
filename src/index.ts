import express from 'express'
const app = express()
import router from './routes/index.router'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/errors.middleware'
import { initFolder } from './utils/file'
import {config} from 'dotenv'
import path from 'path'
import { UPLOAD_DIR } from './constants/dir'


config();
initFolder();

const port = process.env.PORT || 4000

databaseService.run().catch(console.dir);
app.use(express.json());
app.use(router);
app.use('/uploads', express.static(UPLOAD_DIR))

app.use(defaultErrorHandler)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

