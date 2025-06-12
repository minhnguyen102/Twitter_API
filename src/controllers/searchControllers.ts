import { NextFunction, Request, Response } from "express"
import { ParamsDictionary } from "express-serve-static-core"
import { searchQuery } from "~/models/requests/Search.requests"
// [GET] /seacrh
export const searchControllers = async (req: Request<ParamsDictionary, any, any, searchQuery>, res: Response, next: NextFunction) => {
  res.json({})
}
