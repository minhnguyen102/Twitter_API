import { Router, Request, Response, NextFunction } from 'express'
import { usersLogin, usersRegister } from '~/controllers/users.controllers';
import { validateLogin, validateAccesstToken, validateRegister, validateRefreshToken } from '~/middlewares/validates/users.validates';
import { wrapReqHandler } from '~/utils/handles';

const usersRouter = Router()

usersRouter.post("/login", validateLogin, wrapReqHandler(usersLogin))
usersRouter.post("/register", validateRegister, wrapReqHandler(usersRegister))
/*
 * 
 * 
 */
usersRouter.post("/logout", 
  validateAccesstToken,
  validateRefreshToken,
  (req, res) => {
  res.json({
    message : "Logout success"
  })
})
export default usersRouter;
