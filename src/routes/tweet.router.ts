import { Router } from "express"
import { createTweetController, detailTweetChildrenController, detailTweetController } from "~/controllers/tweets.controllers"
import { validateAudience, validateTweetId } from "~/middlewares/validates/bookmarks.validates"
import { validateCreateTweet, validateGetTweetChildren } from "~/middlewares/validates/tweets.validates"
import { validateAccesstToken, validateIsUserLogin, validatorVerifiedUser } from "~/middlewares/validates/users.validates"
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

/*
 * Description: Detail Tweets
 * Path: /tweets/:tweet_id
 * Method: GET
 * Header: {Authorization : Bearer <access_token>}
 */
tweetsRouter.get("/:tweet_id", 
  validateTweetId, 
  validateIsUserLogin(validateAccesstToken), 
  validateIsUserLogin(validatorVerifiedUser), 
  wrapReqHandler(validateAudience),
  wrapReqHandler(detailTweetController))

/*
 * Description: Detail Tweets Children
 * Path: /tweets/:tweet_id/children
 * Method: GET
 * Header: {Authorization : Bearer <access_token>}
 * Query: {skip : number, page: number, type: number}
 */
tweetsRouter.get("/:tweet_id/children", 
  validateTweetId, 
  validateGetTweetChildren,
  validateIsUserLogin(validateAccesstToken), 
  validateIsUserLogin(validatorVerifiedUser), 
  wrapReqHandler(validateAudience),
  wrapReqHandler(detailTweetChildrenController))


export default tweetsRouter