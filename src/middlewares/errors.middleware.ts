import httpStatus from "~/constants/httpStatus"
import { Request, Response, NextFunction } from 'express'
import { omit } from "lodash";
import { ErrorWithStatus } from "~/models/Errors";

export const defaultErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.log(err)
  if(err instanceof ErrorWithStatus){
    res.status(err.status).json(omit(err, ['status']));
  }

  // Để hiển thị lỗi
  Object.getOwnPropertyNames(err).forEach(key => {
    Object.defineProperty(err, key, {enumerable: true})
  })
  res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
    message : err.message,
    inforError: omit(err, ['stack'])
  });
}