import { Router } from "express"
import { bookmarkTweetController, unBookmarkTweetController } from "~/controllers/bookmark.controllers"
import { validateTweetId } from "~/middlewares/validates/bookmarks.validates"
import { validateAccesstToken, validatorVerifiedUser } from "~/middlewares/validates/users.validates"
import { wrapReqHandler } from "~/utils/handles"

const bookmarkRouter = Router()

/*
 * Description: Bookmark tweet
 * Path: /
 * Method: POST
 * Body: {tweet_id: string}
 * Header: {Authorization : Bearer <access_token>}
 */
bookmarkRouter.post("/", validateAccesstToken, validatorVerifiedUser, validateTweetId, wrapReqHandler(bookmarkTweetController))

/*
 * Description: Unbookmark tweet
 * Path: /:tweet_id
 * Method: DELETE
 * Header: {Authorization : Bearer <access_token>}
 */
bookmarkRouter.delete("/tweets/:tweet_id", validateAccesstToken, validatorVerifiedUser, validateTweetId, wrapReqHandler(unBookmarkTweetController))


export default bookmarkRouter