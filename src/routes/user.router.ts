import { Router } from 'express'
import { verifyEmailController, userLogout, usersLogin, usersRegister, resendVerifyEmailController, forgotPasswordController, verifyForgotPasswordController, resetPasswordController, getMeController, followControler, unfollowControler, changePasswordControler, updateMeController } from '~/controllers/users.controllers';
import { validateLogin, validateAccesstToken, validateRegister, validateRefreshToken, validateEmailVerifyToken, validateForgotPassword, validateForgotPasswordToken, validateResetPasswordToken, validatorVerifiedUser, validateUpdateMe, validateFollowed, validateUnfollowed, validateChangePassword } from '~/middlewares/validates/users.validates';
import { wrapReqHandler } from '~/utils/handles';

const usersRouter = Router()

/*
 * Description: Login
 * Path: /users/login
 * Method: POST
 * Body: {email: string, password: string}
 */
usersRouter.post("/login", validateLogin, wrapReqHandler(usersLogin))

/*
 * Description: Register
 * Path: /users/register
 * Method: POST
 * Body: {email: string, password: string, ,confirm_password: string, date_of_birth: string}
 */
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
 * Header: {Authorization : Bearer <access_token>}
 * Yêu cầu đăng nhập rồi mới được resend
 */
usersRouter.post("/resend-verify-email", validateAccesstToken, wrapReqHandler(resendVerifyEmailController))

/*
 * Description:  forgot-password
 * Path: /users/forgot-password
 * Method: POST
 * Body: {email: string}
 */
usersRouter.post("/forgot-password", validateForgotPassword, wrapReqHandler(forgotPasswordController))

/*
 * Description:  verify-forgot-password
 * Path: /users/verify-forgot-password
 * Method: POST
 * Body: {forgot_password_token: string}
 */
usersRouter.post("/verify-forgot-password", validateForgotPasswordToken, wrapReqHandler(verifyForgotPasswordController))

/*
 * Description:  reset-password
 * Path: /users/reset-password
 * Method: POST
 * Body: {forgot_password_token: string, password: string}
 */
usersRouter.post("/reset-password", validateResetPasswordToken, wrapReqHandler(resetPasswordController))

/*
 * Description: get my profile
 * Path: /users/me
 * Method: GET
 * Header: {Authorization : Bearer <access_token>}
 */
usersRouter.get("/me", validateAccesstToken, wrapReqHandler(getMeController))

/*
 * Description: update my profile
 * Path: /users/me
 * Method: PATCH
 * Header: {Authorization : Bearer <access_token>}
 */
usersRouter.patch("/me", validateAccesstToken, validatorVerifiedUser, validateUpdateMe, wrapReqHandler(updateMeController))

/*
 * Description: follow someone
 * Path: /users/follow
 * Method: POST
 * Header: {Authorization : Bearer <access_token>}
 * Body: {followed_user_id: string}
 */
usersRouter.post("/follow", validateAccesstToken, validatorVerifiedUser, validateFollowed, wrapReqHandler(followControler))

/*
 * Description: Unfollow someone
 * Path: /users/Unfollow
 * Method: DELETE
 * Header: {Authorization : Bearer <access_token>}
 * Body: {unfollowed_user_id: string}
 */
usersRouter.delete("/unfollow", validateAccesstToken, validatorVerifiedUser, validateUnfollowed, wrapReqHandler(unfollowControler))

/*
 * Description: Change password
 * Path: /users/change-password
 * Method: POST
 * Header: {Authorization : Bearer <access_token>}
 * Body: {old_password: string, password: string, confirm_password: string}
 */
usersRouter.patch("/change-password", validateAccesstToken, validatorVerifiedUser, validateChangePassword, wrapReqHandler(changePasswordControler))



export default usersRouter;
