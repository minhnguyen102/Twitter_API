import { NextFunction, Request, Response } from "express"
import { ParamsDictionary } from "express-serve-static-core"
import { TweetReqBody } from "~/models/requests/Tweet.requets"
import { TokenPayload } from "~/models/requests/User.requests"
import databaseService from "~/services/database.services"
import tweetService from "~/services/tweet.services"


// [POST] /tweets
export const createTweetController = async (req: Request<ParamsDictionary, any, TweetReqBody>, res: Response, next: NextFunction) => {
  const {user_id} = await req.decoded_authorization as TokenPayload
  const tweet = await tweetService.createTweet(user_id ,req.body)
  // console.log(tweet)
  res.json({
    result : tweet
  })
}

// [POST] /tweets
export const detailTweetController = async (req: Request, res: Response, next: NextFunction) => {
  res.json({
    result: req.tweet
  })
}