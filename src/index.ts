import express from 'express'
const app = express()
const port: number = 3000
import router from './routes/index.router'
import databaseService from './services/database.services'

databaseService.run().catch(console.dir);
app.use(express.json());
app.use(router);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
