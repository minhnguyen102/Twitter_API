import { NextFunction, Request, Response } from "express"
import { ParamsDictionary } from "express-serve-static-core"
import { searchQuery } from "~/models/requests/Search.requests"
import searchService from "~/services/search.services"

// [GET] /seacrh
export const searchControllers = async (req: Request<ParamsDictionary, any, any, searchQuery>, res: Response, next: NextFunction) => {
  const content = req.query.content
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const result = await searchService.search({content, limit, page})
  res.json({
    message: "Search Successfully",
    result
  })
}
