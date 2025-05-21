import { Request, Response, NextFunction, RequestHandler } from 'express'

export const wrapReqHandler = (func: any) => {
  //trả về 1 request handler (Cái này phải có next từ hàm trước mới gọi được. Next được gọi ở bên validation)
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await func(req, res, next); // func này có thể đồng bộ hoặc bất đồng bộ
    } catch (error) {
      next(error) // next lỗi này sẽ chạy đến default error handler ở index.ts
    }
  }
}