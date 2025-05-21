import express from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { RunnableValidationChains } from 'express-validator/lib/middlewares/schema';
import httpStatus from '~/constants/httpStatus';
import { EntityError, ErrorWithStatus } from '~/models/Errors';

// can be reused by many routes
export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    await validation.run(req);
    // Nếu không có lỗi thì cho next reqHandler
    const errors = validationResult(req);
    if(errors.isEmpty()){
      return next();
    }

    // Xử lí lỗi
    const errrorsObject = errors.mapped();
    const entityError = new EntityError({ errors: {} })
    for (const key in errrorsObject) {
      const {msg} = errrorsObject[key];
      // Nếu lỗi khác lỗi validation(422)
      if(msg instanceof ErrorWithStatus && msg.status !== httpStatus.UNPROCESSABLE_ENTITY){
        return next(msg)
      }

      entityError.errors[key] = errrorsObject[key]
    }

    next(entityError);
  }
}
