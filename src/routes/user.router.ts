import { error } from 'console';
import { Router, Request, Response, NextFunction } from 'express'
import { usersLogin, usersRegister } from '~/controllers/users.controllers';
import { validateLogin, validateRegister } from '~/middlewares/validates/users.validates';
import { wrapReqHandler } from '~/utils/handles';

const usersRouter = Router()

usersRouter.post("/login", validateLogin, usersLogin)
usersRouter.post("/register", validateRegister, wrapReqHandler(usersRegister))
export default usersRouter;
