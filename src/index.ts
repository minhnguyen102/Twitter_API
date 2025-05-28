import express from 'express'
const app = express()
const port: number = 4000
import router from './routes/index.router'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/errors.middleware'

databaseService.run().catch(console.dir);
app.use(express.json());
app.use(router);

app.use(defaultErrorHandler)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

