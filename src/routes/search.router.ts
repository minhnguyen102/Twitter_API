import { Router } from "express"
import { searchControllers } from "~/controllers/searchControllers"
import { validateSearch } from "~/middlewares/validates/searchs.validates"
import { validateAccesstToken, validatorVerifiedUser } from "~/middlewares/validates/users.validates"
import { wrapReqHandler } from "~/utils/handles"

const searchRouter = Router()
/*
 * Description: search tweet
 * Path: /tweets
 * Method: GET
 * Header: {Authorization : Bearer <access_token>}
 * * Query: {skip : number, page: number, content: string}
 */
searchRouter.get("/", validateAccesstToken, validatorVerifiedUser, validateSearch, wrapReqHandler(searchControllers))

export default searchRouter
