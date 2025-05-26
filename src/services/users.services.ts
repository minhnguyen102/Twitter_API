import User from "~/models/schemas/User.schema";
import databaseService from "./database.services";
import { RegisterReqBody } from "~/models/requests/User.requests";
import { hashPassword } from "~/utils/crypto";
import { signToken } from "~/utils/jwt";
import { TokenType, UserVerifyStatus } from "~/constants/enums";
import { ObjectId } from "mongodb";
import RefreshToken from "~/models/schemas/RefreshToken.schema";
import { USER_MESSAGE } from "~/constants/messages";


class UsersServices {
  private signAccessToken(user_id: string){
    return signToken({
      payload: {
        user_id,
        type: TokenType.AccessToken
      },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: {
        expiresIn: '15m'
      }
    })
  }
  private signRefreshToken(user_id: string){
    return signToken({
      payload: {
        user_id,
        type: TokenType.RefreshToken
      },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: {
        expiresIn: '100d'
      }
    })
  }

  private signEmailVerifyToken(user_id: string){
    return signToken({
      payload: {
        user_id,
        type: TokenType.EmailVerifyToken
      },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
      options: {
        expiresIn: '7d'
      }
    })
  }

  private signForgotPasswordToken(user_id: string){
    return signToken({
      payload: {
        user_id,
        type: TokenType.ForgotPasswordToken
      },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
      options: {
        expiresIn: '7d'
      }
    })
  }

  private signAccessTokenAndRefreshToken(user_id: string){
    return Promise.all(
      [
        this.signAccessToken(user_id),
        this.signRefreshToken(user_id)
      ])
  }

  // Register
  async regiter(payload: RegisterReqBody){
    const user_id = new ObjectId();
    const email_verify_token = await this.signEmailVerifyToken(user_id.toString())
    await databaseService.users.insertOne(new User({
      ...payload,
      _id: user_id,
      email_verify_token: email_verify_token,
      date_od_birth: new Date(payload.date_of_birth),
      password: hashPassword(payload.password)
      // vì trong interface RegisterReqBody date_of_bỉrth là kiểu string, cần convert lại kiểu Date để hợp với hàm tạo trong class User
    }))

    const [accessToken, refreshToken] = await this.signAccessTokenAndRefreshToken(user_id.toString())
    await databaseService.refreshTokens.insertOne(new RefreshToken({token: refreshToken, user_id: new ObjectId(user_id)}))
    console.log("email_verify_token: ", email_verify_token);
    return {
      accessToken,
      refreshToken,
    }
  }

  // checkEmailExit
  async checkEmailExit(email: string){
    const emailExit = await databaseService.users.findOne({email});
    return Boolean(emailExit); // trả về true nếu email đã tồn tại
  }

  // Login
  async login(user_id: string){
    const [accessToken, refreshToken] = await this.signAccessTokenAndRefreshToken(user_id);
    // refreshTokens
    await databaseService.refreshTokens.insertOne(new RefreshToken({token: refreshToken, user_id: new ObjectId(user_id)}))
    return {
      accessToken,
      refreshToken
    }
  }

  // Logout
  async logout(refresh_token: string){
    return await databaseService.refreshTokens.deleteOne({token: refresh_token})
  }

  // verifyEmail
  async verifyEmail(user_id: string){
    const [token] = await Promise.all([
        this.signAccessTokenAndRefreshToken(user_id),
        await databaseService.users.updateOne(
        {_id: new ObjectId(user_id)},
        {
          $set: {
            email_verify_token: '',
            verify: UserVerifyStatus.Verified,
            updated_at: new Date()
          }
        }
      )
    ])
    const [access_token, refresh_token] = token;

    return {
      access_token,
      refresh_token
    }
  }

  // resendVerifyEmail
  async resendVerifyEmail(user_id: string){
    // Tạo mới token + thay thế token cũ 
    const email_verify_token = await this.signEmailVerifyToken(user_id);
    // Giả lập gửi email cho người dùng
    console.log("Gửi email cho người dùng: ", email_verify_token);

    await databaseService.users.updateOne(
      {_id: new ObjectId(user_id)},
      {
        $set: {
          email_verify_token
        },
        $currentDate:{
          updated_at: true
        }
      }
    )
    return {
      messsage : USER_MESSAGE.RESEND_VERIFY_EMAIL_SUCCESS
    }
  }

  // forgot password
  async forgotPassword(user_id: string){
    const forgot_password_token = await this.signForgotPasswordToken(user_id)
    await databaseService.users.updateOne(
      {_id: new ObjectId( user_id)},
      {
        $set: {
          forgot_password_token
        },
        $currentDate: {
          updated_at: true
        }
      }
    )

    // Gửi mail cho người dùng forgot_password_token
    console.log("Forgot password: ", forgot_password_token)

    return {
      message: USER_MESSAGE.CHECK_EMAIL_TO_RESET_PASSWORD
    }
  }

  // reset password
  async resetPassword(user_id: string, password: string){
    await databaseService.users.updateOne(
      {_id: new ObjectId(user_id)},
      {
        $set: {
          forgot_password_token: "",
          password: hashPassword(password)
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    return {
      message: USER_MESSAGE.RESET_PASSWORD_SUCCESS
    }
  }
}



const usersServices = new UsersServices;
export default usersServices