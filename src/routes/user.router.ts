import { Router } from 'express'
import { userLogout, usersLogin, usersRegister } from '~/controllers/users.controllers';
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
  wrapReqHandler(userLogout))
export default usersRouter;
