import { NextFunction, Response, Request } from "express";
import { checkSchema, header } from "express-validator";
import { JsonWebTokenError } from "jsonwebtoken";
import { capitalize } from "lodash";
import { ObjectId } from "mongodb";
import httpStatus from "~/constants/httpStatus";
import { USER_MESSAGE } from "~/constants/messages";
import { ErrorWithStatus } from "~/models/Errors";
import databaseService from "~/services/database.services";
import usersServices from "~/services/users.services";
import { hashPassword } from "~/utils/crypto";
import { verifyToken } from "~/utils/jwt";
import { validate } from "~/utils/validation";

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
    name: {
      notEmpty: {
        errorMessage: USER_MESSAGE.NAME.REQUIRED
      },
      isString: true,
      isLength: {
        options: {
          min: 1,
          max: 100
        },
        errorMessage: USER_MESSAGE.NAME.INVALID
      },
      trim: true,
    },
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
      isStrongPassword: { // ghi đè các trường
        options: {
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1
        },
        errorMessage: USER_MESSAGE.PASSWORD.WEAK
      }
    },
    confirm_password: {
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
    },
    date_of_birth: {
      isISO8601: {
        options: {
          strict: true,
          strictSeparator: true,
        },
        errorMessage: USER_MESSAGE.DATE_OF_BIRTH.INVALID
      }
    }
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
    forgot_password_token: {
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
            const decode_forgot_password_token = await verifyToken({token: value, secretOrPublicKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string})
            const {user_id} = decode_forgot_password_token
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
            ;(req as Request).decode_forgot_password_token = decode_forgot_password_token;
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
  })
)