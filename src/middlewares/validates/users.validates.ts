import { NextFunction, Response, Request } from "express";
import { checkSchema } from "express-validator";
import { ErrorWithStatus } from "~/models/Errors";
import usersServices from "~/services/users.services";
import { validate } from "~/utils/validation";

export const validateLogin = (req: Request, res : Response, next : NextFunction) => {
  const {email, password} = req.body;
  if(!email || !password){
    res.status(400).json({
      error : "Missing email or password"
    })
    return;
  }
  next();
}

export const validateRegister = validate(
  checkSchema({
    name: {
      notEmpty: true,
      isString: true,
      isLength: {
        options: {
          min: 1,
          max: 100
        }
      },
      trim: true,
    },
    email: {
      notEmpty: true,
      trim: true,
      isEmail: true,
      custom: {
        options: async (value) => {
          const isExitEmail = await usersServices.checkEmailExit(value); // value = req.body.email
          if(isExitEmail){
            throw new Error("Email đã tồn tại!")
          }
          return true;
        }
      }
    },
    password: {
      notEmpty: true,
      isString: true,
      isLength: {
        options: {
          min: 8,
          max: 50,
        },
        errorMessage: "Mật khẩu phải từ 8 đến 50 ký tự"
      },
      isStrongPassword: { // ghi đè các trường
        options: {
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1
        },
        errorMessage: 'Mật khẩu phải chứa ít nhất 1 chữ thường, 1 chữ hoa, 1 số và 1 ký tự đặc biệt'
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
        errorMessage: "Mật khẩu phải từ 8 đến 50 ký tự"
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
            throw new Error("Xác nhận mật khẩu không khớp")
          }
          return true;
        }
      }
    },
    date_of_birth: {
      isISO8601: {
        options: {
          strict: true,
          strictSeparator: true
        }
      }
    }
  })
)