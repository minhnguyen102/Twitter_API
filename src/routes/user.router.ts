import { Router } from 'express'
import { verifyEmailController, userLogout, usersLogin, usersRegister, resendVerifyEmailController } from '~/controllers/users.controllers';
import { validateLogin, validateAccesstToken, validateRegister, validateRefreshToken, validateEmailVerifyToken } from '~/middlewares/validates/users.validates';
import { wrapReqHandler } from '~/utils/handles';

const usersRouter = Router()

usersRouter.post("/login", validateLogin, wrapReqHandler(usersLogin))
usersRouter.post("/register", validateRegister, wrapReqHandler(usersRegister))

/*
 * Description: Logout
 * Path: /users/logout
 * Method: POST
 * Body: {refresh_token: string}
 */
usersRouter.post("/logout", validateAccesstToken, validateRefreshToken, wrapReqHandler(userLogout))

/*
 * Description:  Verify-email
 * Path: /users/verify-email
 * Method: POST
 * Body: {email_verify_token: string}
 */
usersRouter.post("/verify-email", validateEmailVerifyToken, wrapReqHandler(verifyEmailController))

/*
 * Description:  resend-verify-email
 * Path: /users/verify-email
 * Method: POST
 * Body: {}
 * Header: Authorization : access_token
 * Yêu cầu đăng nhập rồi mới được resend
 */
usersRouter.post("/resend-verify-email", validateAccesstToken, wrapReqHandler(resendVerifyEmailController))

export default usersRouter;
