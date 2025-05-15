import { Router } from 'express'
import { usersLogin, usersRegister } from '~/controllers/users.controllers';
import { validateLogin } from '~/middlewares/validates/users.validates';

const usersRouter = Router()

usersRouter.post("/login", validateLogin, usersLogin)
usersRouter.post("/register", usersRegister)

export default usersRouter;
