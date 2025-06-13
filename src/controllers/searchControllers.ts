import { NextFunction, Request, Response } from "express"
import { ParamsDictionary } from "express-serve-static-core"
import { searchQuery } from "~/models/requests/Search.requests"
import { TokenPayload } from "~/models/requests/User.requests"
import searchService from "~/services/search.services"

// [GET] /seacrh
export const searchControllers = async (req: Request<ParamsDictionary, any, any, searchQuery>, res: Response, next: NextFunction) => {
  const content = req.query.content
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const {user_id} = req.decoded_authorization as TokenPayload
  const mediaType = req.query.mediaType
  const peopleFollow = req.query.peopleFollow
  const {tweets, totalDocument} = await searchService.search({content, limit, page, user_id, mediaType, peopleFollow})
  res.json({
    message: "Search Successfully",
    result: {
      tweets,
      limit,
      page,
      totalPage: Math.ceil(totalDocument / limit)
    }
  })
}
