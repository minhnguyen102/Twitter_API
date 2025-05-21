import { NextFunction, Response, Request } from "express";
import { checkSchema } from "express-validator";
import { USER_MESSAGE } from "~/constants/messages";
import { ErrorWithStatus } from "~/models/Errors";
import databaseService from "~/services/database.services";
import usersServices from "~/services/users.services";
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
          const user = await databaseService.users.findOne({email: value}); // value = req.body.email
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
  })
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
  })
)