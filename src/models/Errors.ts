import httpStatus from "~/constants/httpStatus"
import { USER_MESSAGE } from "~/constants/messages"

type ErrorType = Record<
  string,
  {
    msg: string
    [key: string]: any
  }
>
// Không kế thừa class Error vì sẽ bị mất thông tin khi truyền vào
export class ErrorWithStatus {
  message: string
  status: number

  constructor({message, status} : {message: string, status: number}){
    this.message = message
    this.status = status
  }
}


export class EntityError extends ErrorWithStatus{
  errors: ErrorType
  constructor({message = USER_MESSAGE.VALIDATION_ERROR, status = httpStatus.UNPROCESSABLE_ENTITY, errors} : {message?: string, status?: number, errors: ErrorType}){
    super({message, status})
    this.errors = errors
  }
}


