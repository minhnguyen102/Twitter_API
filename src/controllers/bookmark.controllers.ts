import { NextFunction, Request, Response } from "express"
import { ParamsDictionary } from "express-serve-static-core"
import { BOOKMARK_MESSAGE } from "~/constants/messages"
import { bookmarkTweetReqBody } from "~/models/requests/Bookmark.requests"
import { TokenPayload } from "~/models/requests/User.requests"
import bookmarkService from "~/services/bookmark.services"


// [POST] /bookmarks
export const bookmarkTweetController = async (req: Request<ParamsDictionary, any, bookmarkTweetReqBody>, res: Response, next: NextFunction) => {
  const {user_id} = await req.decoded_authorization as TokenPayload
  const result = await bookmarkService.bookmarkTweet(user_id ,req.body.tweet_id)
  res.json({
    message : BOOKMARK_MESSAGE.BOOKMARK_SUCCESSFULLY,
    result : result
  })
}

// [POST] /bookmarks
export const unBookmarkTweetController = async (req: Request, res: Response, next: NextFunction) => {
  const {user_id} = await req.decoded_authorization as TokenPayload
  const result = await bookmarkService.unBookmarkTweet(user_id, req.params.tweet_id)
  res.json({
    result : result
  })
}