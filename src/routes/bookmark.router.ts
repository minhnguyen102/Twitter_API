import { Router } from "express"
import { bookmarkTweetController } from "~/controllers/bookmark.controllers"
import { validateAccesstToken, validatorVerifiedUser } from "~/middlewares/validates/users.validates"
import { wrapReqHandler } from "~/utils/handles"

const bookmarkRouter = Router()

/*
 * Description: Bookmark tweet
 * Path: /
 * Method: POST
 * Body: {tweet_id: ObjectId}
 * Header: {Authorization : Bearer <access_token>}
 */
bookmarkRouter.post("/", validateAccesstToken, validatorVerifiedUser, wrapReqHandler(bookmarkTweetController))


export default bookmarkRouter