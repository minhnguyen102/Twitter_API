import { Request, Response } from "express";
import usersServices from "~/services/users.services";
import { NextFunction, ParamsDictionary } from 'express-serve-static-core'
import { RegisterReqBody } from "~/models/requests/User.requests";

// [POST] /users/login
export const usersLogin = (req: Request, res: Response) => {
  const {email, password} = req.body;
  const db = {
    email : "minhkhac1002@gmail.com",
    password : "123456"
  }
  if(email === db.email && password === db.password){
    res.status(200).json({
      message : "Login success"
    })
  }else{
    res.status(400).json({
      error : "Error"
    })
  }
}

// [POST] /users/register
export const usersRegister = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response, next: NextFunction) => {
  const  user = await usersServices.regiter(req.body);
  return res.json({
    message : "Success",
    user : user
  })
}