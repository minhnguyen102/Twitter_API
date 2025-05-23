import { Request, Response } from "express";
import usersServices from "~/services/users.services";
import { NextFunction, ParamsDictionary } from 'express-serve-static-core'
import { LogoutReqBody, RegisterReqBody, TokenPayload } from "~/models/requests/User.requests";
import User from "~/models/schemas/User.schema";
import { Collection, ObjectId } from "mongodb";
import { USER_MESSAGE } from "~/constants/messages";
import databaseService from "~/services/database.services";
import httpStatus from "~/constants/httpStatus";

// [POST] /users/login
export const usersLogin = async (req: Request, res: Response) => {
  const user = req.user as User
  const user_id = user._id as ObjectId
  const results = await usersServices.login(user_id.toString())
  const {accessToken, refreshToken} = results
  return res.json({
    message: USER_MESSAGE.LOGIN_SUCCESS,
    accessToken,
    refreshToken
  })
}

// [POST] /users/register
export const usersRegister = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  const  user = await usersServices.regiter(req.body);
  return res.json({
    message : USER_MESSAGE.REGISTER_SUCCESS,
    user : user
  })
}

// [POST] /users/logout
export const userLogout = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
  const { refresh_token } = req.body;
  await usersServices.logout(refresh_token);
  return res.json({
    message: USER_MESSAGE.LOGOUT_SUCCESS
  })
}

// 
export const emailVerify = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_email_verify_token as TokenPayload;
  const user = await databaseService.users.findOne({_id: new ObjectId(user_id)});

  if(!user){
    return res.status(httpStatus.NOT_FOUND).json({
      message: USER_MESSAGE.USER_NOT_FOUND
    })
  }

  if(user?.email_verify_token === ""){
    return res.status(httpStatus.UNAUTHORIZED).json({
      message : USER_MESSAGE.EMAIL_ALREADY_VERIFIED_BEFORE
    })
  }

  const result = await usersServices.verifyEmail(user_id);
  return res.json({
    message : USER_MESSAGE.VERIFY_EMAIL_SUCCESS,
    result
  })
}