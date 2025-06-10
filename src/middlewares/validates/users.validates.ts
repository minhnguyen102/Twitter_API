import { NextFunction, Response, Request } from "express";
import { check, checkSchema, header, ParamSchema } from "express-validator";
import { JsonWebTokenError } from "jsonwebtoken";
import { capitalize } from "lodash";
import { ObjectId } from "mongodb";
import { UserVerifyStatus } from "~/constants/enums";
import httpStatus from "~/constants/httpStatus";
import { USER_MESSAGE } from "~/constants/messages";
import { REGEX_USERNAME } from "~/constants/regex";
import { ErrorWithStatus } from "~/models/Errors";
import { TokenPayload } from "~/models/requests/User.requests";
import User from "~/models/schemas/User.schema";
import databaseService from "~/services/database.services";
import usersServices from "~/services/users.services";
import { hashPassword } from "~/utils/crypto";
import { verifyToken } from "~/utils/jwt";
import { validate } from "~/utils/validation";

const PasswordSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USER_MESSAGE.PASSWORD.REQUIRED
  },
  isString: true,
  isLength: {
    options: {
      min: 8,
      max: 50,
    },
    errorMessage: USER_MESSAGE.PASSWORD.LENGTH
  },
  isStrongPassword: { // ghi đè các trường
    options: {
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    },
    errorMessage: USER_MESSAGE.PASSWORD.WEAK
  }
}
const ConfirmPasswordSchema: ParamSchema = {
  notEmpty: true,
  isString: true,
  isLength: {
    options: {
      min: 8,
      max: 50,
    },
    errorMessage: USER_MESSAGE.CONFIRM_PASSWORD.LENGTH
  },
  isStrongPassword: { // ghi đè các trường
    options: {
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    },
    errorMessage: 'Mật khẩu phải chứa ít nhất 1 chữ thường, 1 chữ hoa, 1 số và 1 ký tự đặc biệt'
  },
  custom: {
    options: (value, {req}) => {
      if(value !== req.body.password){
        throw new Error(USER_MESSAGE.CONFIRM_PASSWORD.NOT_MATCH)
      }
      return true;
    }
  }
}
const ForgotPasswordTokenSchema: ParamSchema = {
  trim: true,
  custom: { 
    options: async (value, {req}) => {
      if(!value){
        throw new ErrorWithStatus({
          message:  USER_MESSAGE.FORGOT_PASSWORD_TOKEN_IS_REQUIRED,
          status: httpStatus.UNAUTHORIZED
        })
      }
      try {
        const decoded_forgot_password_token = await verifyToken({token: value, secretOrPublicKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string})
        const {user_id} = decoded_forgot_password_token
        const user = await databaseService.users.findOne({_id: new ObjectId(user_id)})
        
        if(user === null){
          throw new ErrorWithStatus({
            message: USER_MESSAGE.USER_NOT_FOUND, 
            status: httpStatus.UNAUTHORIZED
          })
        }
        if(user.forgot_password_token !== value){
          throw new ErrorWithStatus({
            message: USER_MESSAGE.FORGOT_PASSWORD_TOKEN_IS_INVALID, 
            status: httpStatus.UNAUTHORIZED
          })
        }
        ;(req as Request).decoded_forgot_password_token = decoded_forgot_password_token;
      } catch (error) {
        if(error instanceof JsonWebTokenError){
          throw new ErrorWithStatus({
            message: USER_MESSAGE.FORGOT_PASSWORD_TOKEN_IS_INVALID, 
            status: httpStatus.UNAUTHORIZED
          })
        }
        throw error
      }
      return true
    }
  }
}
const NameSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USER_MESSAGE.NAME.REQUIRED
  },
  isString: {
    errorMessage: USER_MESSAGE.NAME.STRING
  },
  isLength: {
    options: {
      min: 1,
      max: 100
    },
    errorMessage: USER_MESSAGE.NAME.INVALID
  },
  trim: true
}
const DateOfBirthSchema = {
      isISO8601: {
        options: {
          strict: true,
          strictSeparator: true,
        },
        errorMessage: USER_MESSAGE.DATE_OF_BIRTH.INVALID
      }
    }

export const validateLogin = validate(
  checkSchema({
    email: {
      notEmpty: {
        errorMessage: USER_MESSAGE.EMAIL.REQUIRED
      },
      trim: true,
      isEmail: {
        errorMessage: USER_MESSAGE.EMAIL.INVALID
      },
      custom: {
        options: async (value, {req}) => {
          const user = await databaseService.users.findOne({email: value, password: hashPassword(req.body.password)}); // value = req.body.email
          if(!user){
            throw new Error(USER_MESSAGE.USER_NOT_FOUND)
          }
          req.user = user
          return true;
        }
      }
    },
    password: {
      notEmpty: {
        errorMessage: USER_MESSAGE.PASSWORD.REQUIRED
      },
      isString: true,
      isLength: {
        options: {
          min: 8,
          max: 50,
        },
        errorMessage: USER_MESSAGE.PASSWORD.LENGTH
      },
    }
  },['body'])
)

export const validateRegister = validate(
  checkSchema({
    name: NameSchema,
    email: {
      notEmpty: {
        errorMessage: USER_MESSAGE.EMAIL.REQUIRED
      },
      trim: true,
      isEmail: {
        errorMessage: USER_MESSAGE.EMAIL.INVALID
      },
      custom: {
        options: async (value) => {
          const isExitEmail = await usersServices.checkEmailExit(value); // value = req.body.email
          if(isExitEmail){
            throw new Error(USER_MESSAGE.EMAIL.EXISTS)
          }
          return true;
        }
      }
    },
    password: PasswordSchema,
    confirm_password: ConfirmPasswordSchema,
    date_of_birth: DateOfBirthSchema
  }, ['body'])
)

export const validateAccesstToken = validate(
  checkSchema({
    authorization: {
      trim: true,
      custom: { // Kiểm tra tính hợp lệ của access_token + verify
        options: async (value: string, {req}) => {
          if(!value){
            throw new ErrorWithStatus({
              message:  USER_MESSAGE.ACCESS_TOKEN_IS_REQUIRED,
              status: httpStatus.UNAUTHORIZED
            })
          }
          const accessToken = (value || '').split(" ")[1]
          if(!accessToken){
            throw new ErrorWithStatus({message: USER_MESSAGE.ACCESS_TOKEN_IS_REQUIRED, status: httpStatus.UNAUTHORIZED}) // tương đương với việc trả về Promise.reject
          }
          try {
            const decoded_authorization = await verifyToken({token : accessToken, secretOrPublicKey: process.env.JWT_SECRET_ACCESS_TOKEN as string})
            // console.log(decoded_authorization);
            ;(req as Request).decoded_authorization = decoded_authorization // mục đích là để cho decoded_authorization không phải kiểu any
            // req.decoded_authorization = decoded_authorization 
          } catch (error) {
            return new ErrorWithStatus({
              message: (error as JsonWebTokenError).message,
              status: httpStatus.UNAUTHORIZED
            })
          }
          return true
        }
      }
    }
  },['headers'])
)

export const validateRefreshToken = validate(
  checkSchema({
    refresh_token: {
      trim: true,
      custom: { // verify + decoded refresh_token
        options: async (value, {req}) => {
          if(!value){
            throw new ErrorWithStatus({
              message:  USER_MESSAGE.REFRESH_TOKEN_IS_REQUIRED,
              status: httpStatus.UNAUTHORIZED
            })
          }
          try {
            const [decoded_refresh_token, refresh_token] = await Promise.all([
              verifyToken({token: value, secretOrPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN as string}), 
              databaseService.refreshTokens.findOne({token: value})
            ])
            if(refresh_token === null){
              throw new ErrorWithStatus({
                message: USER_MESSAGE.USED_REFRESH_TOKEN_OR_NOT_EXIT, 
                status: httpStatus.UNAUTHORIZED
              })
            }
            ;(req as Request).decoded_refresh_token = decoded_refresh_token;
            // req.decoded_refresh_token = decoded_refresh_token
          } catch (error) {
            if(error instanceof JsonWebTokenError){
              throw new ErrorWithStatus({
                message: USER_MESSAGE.REFRESH_TOKEN_IS_INVALID, 
                status: httpStatus.UNAUTHORIZED
              }) // refresh_token đã hết hạn hoặc sai
            }
            throw error
          }
          return true
        }
      }
    }
  },['body'])
)

export const validateEmailVerifyToken = validate(
  checkSchema({
    email_verify_token: {
      trim: true,
      custom: { 
        options: async (value, {req}) => {
          if(!value){
            throw new ErrorWithStatus({
              message:  USER_MESSAGE.EMAIL_VERIFY_TOKEN_IS_REQUIRED,
              status: httpStatus.UNAUTHORIZED
            })
          }
          try {
            const decoded_email_verify_token = await verifyToken({token: value, secretOrPublicKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string})              
            // console.log(decoded_email_verify_token);
            ;(req as Request).decoded_email_verify_token = decoded_email_verify_token            
          } catch (error) {
            throw new ErrorWithStatus({
              message: capitalize((error as JsonWebTokenError).message),
              status: httpStatus.UNAUTHORIZED
            })
          }

          return true
        }
      }
    }
  },['body'])
)

export const validateForgotPassword = validate(
  checkSchema({
    email: {
      notEmpty: {
        errorMessage: USER_MESSAGE.EMAIL.REQUIRED
      },
      trim: true,
      isEmail: {
        errorMessage: USER_MESSAGE.EMAIL.INVALID
      },
      custom: {
        options: async (value, {req}) => {
          const user = await databaseService.users.findOne({email: value}); // value = req.body.email
          if(!user){
            throw new Error(USER_MESSAGE.USER_NOT_FOUND)
          }
          req.user = user
          return true;
        }
      }
    }}
  )
)

export const validateForgotPasswordToken = validate(
  checkSchema({
    forgot_password_token: ForgotPasswordTokenSchema
  })
)

export const validateResetPasswordToken = validate(
  checkSchema({
    password: PasswordSchema,
    confirm_password: ConfirmPasswordSchema,
    forgot_password_token: ForgotPasswordTokenSchema
  },['body'])
)

export const validatorVerifiedUser = (req: Request, res: Response, next: NextFunction) => {
  const {verify} = req.decoded_authorization as TokenPayload
  if(verify !== UserVerifyStatus.Verified){
    next(new ErrorWithStatus({
      message: USER_MESSAGE.USER_NOT_VERIFIED,
      status: httpStatus.FORBIDDEN
    }))
  }
  next();
}

export const validateUpdateMe = validate(
  checkSchema({
    name: {
      ...NameSchema,
      optional: true,
      notEmpty: undefined
    },
    date_od_birth: {
      ...DateOfBirthSchema,
      optional: true
    },
    bio: {
      optional: true,
      isString: {
        errorMessage: USER_MESSAGE.BIO.STRING
      },
      trim: true,
      isLength: {
        options: {
          min: 1,
          max: 100
        },
        errorMessage: USER_MESSAGE.BIO.LENGTH
      },
    },
    location: {
      optional: true,
      isString: {
        errorMessage: USER_MESSAGE.LOCATION.STRING
      },
      trim: true,
      isLength: {
        options: {
          min: 1,
          max: 100
        },
        errorMessage: USER_MESSAGE.LOCATION.LENGTH
      },
    },
    website: {
      optional: true,
      isString: {
        errorMessage: USER_MESSAGE.WEBSITE.STRING
      },
      trim: true,
      isLength: {
        options: {
          min: 1,
          max: 300
        },
        errorMessage: USER_MESSAGE.WEBSITE.LENGTH
      },
    },
    username: {
      optional: true,
      isString: {
        errorMessage: USER_MESSAGE.USERNAME.STRING
      },
      trim: true,
      custom:{
        options: async (value: string, {req}) =>{
          if(!(REGEX_USERNAME.test(value))){
            console.log(1)
            throw new Error(USER_MESSAGE.USERNAME.INVALID)
          }
          const user = await databaseService.users.findOne({username: value})
          if(user){
            throw new Error(USER_MESSAGE.USERNAME_EXISTED)
          }
        }
      }
    },
    avatar: {
      optional: true,
      isString: {
        errorMessage: USER_MESSAGE.IMAGE.STRING
      },
      trim: true,
      isLength: {
        options: {
          min: 1,
          max: 400
        },
        errorMessage: USER_MESSAGE.IMAGE.LENGTH
      },
    },
    cover_photo: {
      optional: true,
      isString: {
        errorMessage: USER_MESSAGE.IMAGE.STRING
      },
      trim: true,
      isLength: {
        options: {
          min: 1,
          max: 400
        },
        errorMessage: USER_MESSAGE.IMAGE.LENGTH
      },
    },
  },['body'])
)

export const validateFollowed = validate(
  checkSchema({
    followed_user_id: {
      custom: {
        options: async (value: string, {req}) => {
          if(!ObjectId.isValid(value)){
            throw new ErrorWithStatus({
              message: USER_MESSAGE.INVALID_FOLLOWED_USER_ID,
              status: httpStatus.NOT_FOUND
            })
          }
          const followed_user = await databaseService.users.findOne({
            _id: new ObjectId(value)
          })

          if(followed_user === null){
            throw new ErrorWithStatus({
              message: USER_MESSAGE.USER_NOT_FOUND,
              status: httpStatus.NOT_FOUND
            })
          }
        }
      }
    }
  },['body'])
)
export const validateUnfollowed = validate(
  checkSchema({
    unfollowed_user_id: {
      custom: {
        options: async (value: string, {req}) => {
          if(!ObjectId.isValid(value)){
            throw new ErrorWithStatus({
              message: USER_MESSAGE.INVALID_FOLLOWED_USER_ID,
              status: httpStatus.NOT_FOUND
            })
          }
          const unfollowed_user = await databaseService.users.findOne({
            _id: new ObjectId(value)
          })

          if(unfollowed_user === null){
            throw new ErrorWithStatus({
              message: USER_MESSAGE.USER_NOT_FOUND,
              status: httpStatus.NOT_FOUND
            })
          }
        }
      }
    }
  },['body'])
)

export const validateChangePassword = validate(checkSchema({
  old_password: {
    ...PasswordSchema,
    custom: {
      options: async (value: string, { req })=>{
        const {user_id} = (req as Request).decoded_authorization as TokenPayload
        const user = await databaseService.users.findOne({_id: new ObjectId(user_id)}) as User
        if(!user){
          throw new ErrorWithStatus({
            message: USER_MESSAGE.USER_NOT_FOUND,
            status: httpStatus.NOT_FOUND
          })
        }

        if(user.password !== hashPassword(value)){
          throw new ErrorWithStatus({
            message: USER_MESSAGE.OLD_PASSWORD_NOT_MATCH,
            status: httpStatus.UNAUTHORIZED
          })
        }
      }
    }
  },
  password: PasswordSchema,
  confirm_password: ConfirmPasswordSchema
}))

// Nếu người dùng có đăng nhập thì kiểm tra access_token => user_id => so sánh trong tweeter_circle và verify_user. Không thì vẫn next()
export const validateIsUserLogin = (middleware: (req: Request, res: Response, next: NextFunction) => void) => {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log(req.headers)
    if(req.headers.authorization){
      return  middleware(req, res, next)
    }
    next()
  }
}