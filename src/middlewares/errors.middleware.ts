import httpStatus from "~/constants/httpStatus"
import { Request, Response, NextFunction } from 'express'
import { omit } from "lodash";

export const defaultErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.log(err)
  res.status(err.status || httpStatus.SERVICE_UNAVAILABLE).json(omit(err, ['status']));
}