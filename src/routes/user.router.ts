import { Router } from 'express'
import { usersLogin, usersRegister } from '~/controllers/users.controllers';
import { validateLogin, validateRegister } from '~/middlewares/validates/users.validates';

const usersRouter = Router()

usersRouter.post("/login", validateLogin, usersLogin)
usersRouter.post("/register", validateRegister, usersRegister)

export default usersRouter;
