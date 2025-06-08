import { Router } from "express"
import { createTweetController } from "~/controllers/tweets.controllers"
import { validateCreateTweet } from "~/middlewares/validates/tweets.validates"
import { validateAccesstToken, validatorVerifiedUser } from "~/middlewares/validates/users.validates"
import { wrapReqHandler } from "~/utils/handles"

const tweetsRouter = Router()

/*
 * Description: Create Tweets
 * Path: /tweets
 * Method: POST
 * Body: {}
 * Header: {Authorization : Bearer <access_token>}
 */
tweetsRouter.post("/", validateAccesstToken, validatorVerifiedUser, validateCreateTweet, wrapReqHandler(createTweetController))


export default tweetsRouter