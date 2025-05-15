import { Request, Response } from "express";
import User from "~/models/schemas/User.schema";
import databaseService from "~/services/database.services";
import usersServices from "~/services/users.services";


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
export const usersRegister = async (req: Request, res: Response) => {
  const {email, password} = req.body;
  
  try {
    const  user = await usersServices.regiter({email, password});
    res.json({
      message : "Success",
      user : user
    })
  } catch (error) {
    res.status(400).json({
      error : error,
      message : "Register Faile"
    })
  }
  

}