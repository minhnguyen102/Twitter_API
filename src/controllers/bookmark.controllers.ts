import { NextFunction, Request, Response } from "express"
import { ParamsDictionary } from "express-serve-static-core"
import { BOOKMARK_MESSAGE } from "~/constants/messages"
import { bookmarkTweetReqBody } from "~/models/requests/Bookmark.requests"
import { TokenPayload } from "~/models/requests/User.requests"
import bookmarkService from "~/services/bookmark.services"


// [POST] /tweets
export const bookmarkTweetController = async (req: Request<ParamsDictionary, any, bookmarkTweetReqBody>, res: Response, next: NextFunction) => {
  const {user_id} = await req.decoded_authorization as TokenPayload
  const result = await bookmarkService.bookmarkTweet(user_id ,req.body.tweet_id)
  res.json({
    message : BOOKMARK_MESSAGE.BOOKMARK_SUCCESSFULLY,
    result : result
  })
}