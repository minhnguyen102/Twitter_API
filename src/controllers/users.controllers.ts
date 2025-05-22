import { Request, Response } from "express";
import usersServices from "~/services/users.services";
import { NextFunction, ParamsDictionary } from 'express-serve-static-core'
import { LogoutReqBody, RegisterReqBody } from "~/models/requests/User.requests";
import User from "~/models/schemas/User.schema";
import { ObjectId } from "mongodb";
import { USER_MESSAGE } from "~/constants/messages";

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
  res.json({
    message: USER_MESSAGE.LOGOUT_SUCCESS
  })
}