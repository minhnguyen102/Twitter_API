import { Router } from "express"
import { searchControllers } from "~/controllers/searchControllers"

const searchRouter = Router()

searchRouter.get("/", searchControllers)

export default searchRouter
