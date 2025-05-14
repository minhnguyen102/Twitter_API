import { Request, Response } from "express";

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