import { NextFunction, Request, Response } from "express"
import { ParamsDictionary } from "express-serve-static-core"
import { TweetReqBody } from "~/models/requests/Tweet.requets"

// [POST] /tweets
export const createTweetController = async (req: Request<ParamsDictionary, any, TweetReqBody>, res: Response, next: NextFunction) => {
  res.send("OK")
}