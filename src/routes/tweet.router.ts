import { Router } from "express"
import { createTweetController } from "~/controllers/tweets.controllers"
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
tweetsRouter.post("/", validateAccesstToken, validatorVerifiedUser, wrapReqHandler(createTweetController))


export default tweetsRouter