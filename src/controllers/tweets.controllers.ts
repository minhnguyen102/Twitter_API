import { NextFunction, Request, Response } from "express"
import { ParamsDictionary } from "express-serve-static-core"
import { TweetType } from "~/constants/enums"
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

// [GET] /tweets/:tweet_id
export const detailTweetController = async (req: Request, res: Response, next: NextFunction) => {
  const views = await tweetService.increaseView(req.params.tweet_id, req.decoded_authorization?.user_id)
  const tweet = {
    ...req.tweet,
    guest_views : views.guest_views,
    user_views: views.user_views
  }
  res.json({
    result: tweet
  })
}

// [GET] /tweets/:tweet_id
export const detailTweetChildrenController = async (req: Request, res: Response, next: NextFunction) => {
  const tweet_id = req.params.tweet_id // parent_id
  const type = Number(req.query.type as string) as TweetType
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)

  const {tweetDetailChildren, totalDocument} = await tweetService.getDetailTweetChildren({tweet_id, type, limit, page})
  res.json({
    message: "Get tweet detail children successfully",
    tweetDetailChildren,
    type,
    limit,
    page, 
    totalPage: Math.ceil(totalDocument / limit)
  })
}
