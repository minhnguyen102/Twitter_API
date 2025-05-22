import { NextFunction, Response, Request } from "express";
import { checkSchema, header } from "express-validator";
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
      notEmpty: {
        errorMessage: USER_MESSAGE.ACCESS_TOKEN_IS_REQUIRED
      },
      custom: {
        options: async (value: string, {req}) => {
          const accessToken = value.split(" ")[1]
          if(!accessToken){
            throw new ErrorWithStatus({message: USER_MESSAGE.ACCESS_TOKEN_IS_REQUIRED, status: httpStatus.UNAUTHORIZED}) // tương đương với việc trả về Promise.reject
          }
          // giải mã access_token => lấy user_Id;
          const decoded_authorization = await verifyToken({token : accessToken})
          req.decoded_authorization = decoded_authorization
          return true
        }
      }
    }
  },['headers'])
)

export const validateRefreshToken = validate(
  checkSchema({
    refresh_token: {
      notEmpty: {
        errorMessage: USER_MESSAGE.REFRESH_TOKEN_IS_REQUIRED
      },
      custom: {
        options: async (value, {req}) => {
          try {
            const [decode_refresh_token, refresh_token] = await Promise.all([verifyToken({token: value}), databaseService.refreshTokens.findOne({token: value})])
            if(!refresh_token){
              throw new ErrorWithStatus({message: USER_MESSAGE.USED_REFRESH_TOKEN_OR_NOT_EXIT, status: httpStatus.UNAUTHORIZED})
            }
            req.decode_refresh_token = decode_refresh_token
          } catch (error) {
            throw new ErrorWithStatus({message: USER_MESSAGE.REFRESH_TOKEN_IS_INVALID, status: httpStatus.UNAUTHORIZED}) // refresh_token đã hết hạn hoặc sai
          }
          return true
        }
      }
    }
  },['body'])
)