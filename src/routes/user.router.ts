import { Router } from 'express'
import { usersLogin } from '~/controllers/users.controllers';
import { validateLogin } from '~/middlewares/validates/users.validates';

const usersRouter = Router()

usersRouter.post("/login", validateLogin, usersLogin)

export default usersRouter;
