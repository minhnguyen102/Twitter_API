import User from "~/models/schemas/User.schema";
import databaseService from "./database.services";
import { RegisterReqBody, UpdateMeReqBody } from "~/models/requests/User.requests";
import { hashPassword } from "~/utils/crypto";
import { signToken } from "~/utils/jwt";
import { TokenType, UserVerifyStatus } from "~/constants/enums";
import { ObjectId } from "mongodb";
import RefreshToken from "~/models/schemas/RefreshToken.schema";
import { USER_MESSAGE } from "~/constants/messages";
import Follower from "~/models/schemas/Follower.schema";
import axios from "axios";
import { ErrorWithStatus } from "~/models/Errors";
import httpStatus from "~/constants/httpStatus";
import randomPassword from "~/utils/randomPassword";
import { generateUniqueName } from "~/utils/randomName";
import {config} from 'dotenv'
config()

class UsersServices {
  private signAccessToken({ user_id, verify } : {user_id: string, verify: UserVerifyStatus}){
    return signToken({
      payload: {
        user_id,
        type: TokenType.AccessToken,
        verify
      },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: {
        expiresIn: '15m'
      }
    })
  }
  private signRefreshToken({ user_id, verify, exp } : {user_id: string, verify: UserVerifyStatus, exp?: number}){
    if(exp){
      return signToken({
        payload: {
          user_id,
          type: TokenType.RefreshToken,
          verify,
          exp
        },
        privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      })
    }
    return signToken({
      payload: {
        user_id,
        type: TokenType.RefreshToken,
        verify
      },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: {
        expiresIn: '100d'
      }
    })
  }

  private signEmailVerifyToken({ user_id, verify } : {user_id: string, verify: UserVerifyStatus}){
    return signToken({
      payload: {
        user_id,
        type: TokenType.EmailVerifyToken,
        verify
      },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
      options: {
        expiresIn: '7d'
      }
    })
  }

  private signForgotPasswordToken({ user_id, verify } : {user_id: string, verify: UserVerifyStatus}){
    return signToken({
      payload: {
        user_id,
        type: TokenType.ForgotPasswordToken,
        verify
      },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
      options: {
        expiresIn: '7d'
      }
    })
  }

  private signAccessTokenAndRefreshToken({ user_id, verify } : {user_id: string, verify: UserVerifyStatus}){
    return Promise.all(
      [
        this.signAccessToken({user_id, verify}),
        this.signRefreshToken({user_id, verify})
      ])
  }

  // Register
  async regiter(payload: RegisterReqBody){
    const user_id = new ObjectId();
    const email_verify_token = await this.signEmailVerifyToken({user_id: user_id.toString(), verify: UserVerifyStatus.Unverified})
    await databaseService.users.insertOne(new User({
      ...payload,
      _id: user_id,
      email_verify_token: email_verify_token,
      date_od_birth: new Date(payload.date_of_birth),
      password: hashPassword(payload.password),
      // vì trong interface RegisterReqBody date_of_bỉrth là kiểu string, cần convert lại kiểu Date để hợp với hàm tạo trong class User
      // cần gen thêm username ở đây: 
      username: generateUniqueName()
    }))

    const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken({user_id: user_id.toString(), verify: UserVerifyStatus.Unverified})
    await databaseService.refreshTokens.insertOne(new RefreshToken({token: refresh_token, user_id: new ObjectId(user_id)}))
    console.log("email_verify_token: ", email_verify_token);
    return {
      access_token,
      refresh_token,
    }
  }

  // checkEmailExit
  async checkEmailExit(email: string){
    const emailExit = await databaseService.users.findOne({email});
    return Boolean(emailExit); // trả về true nếu email đã tồn tại
  }

  // Login
  async login({user_id, verify}:{user_id: string, verify: UserVerifyStatus}){
    
    const [accessToken, refreshToken] = await this.signAccessTokenAndRefreshToken({user_id, verify});
    // refreshTokens
    await databaseService.refreshTokens.insertOne(new RefreshToken({token: refreshToken, user_id: new ObjectId(user_id)}))
    return {
      accessToken,
      refreshToken
    }
  }

  private async getOAuthGoogleToken(code: string){
    const url = 'https://oauth2.googleapis.com/token'

    const body = {
      code, 
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code'
    }

    try {
      const {data} = await axios.post(url, body, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      return data as {
        access_token: string,
        id_token: string
      }
    } catch (error: any) {
      console.error('Failed to get Google OAuth Tokens')
      throw new Error(error.message)
    }
  }

  private async getGoogleUserInfo(access_token: string, id_token: string){
    try {
      const {data} = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        params: {
          access_token,
          alt: 'json'
        },
        headers: {
          Authorization: `Bearer ${id_token}`
        }
      })
      return data as {
        sub: string,
        name: string,
        email: string,
        picture: string,
        email_verified: boolean
      }
    } catch (error: any) {
      console.error('Failed to fetch Google user info')
      throw new Error(error.message)
    }
  }

  // oauth 
  async oauth(code: string) {
    const {access_token, id_token} = await this.getOAuthGoogleToken(code)
    const userInfor = await this.getGoogleUserInfo(access_token, id_token);
    if(!userInfor.email_verified){
      throw new ErrorWithStatus({
        message: USER_MESSAGE.GMAIL_NOT_VERIFY,
        status: httpStatus.BAD_REQUEST
      })
    }
    const user = await databaseService.users.findOne({email: userInfor.email})
    // Nếu user đã tồn tại => cho phép đăng nhập => trả về cắp token
    if(user){
      const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken({
        user_id: user._id.toString(),
        verify: user.verify
      })
      await databaseService.refreshTokens.insertOne(new RefreshToken({token: refresh_token, user_id: user._id}))
      return {
        access_token,
        refresh_token,
        newUser: 0,
        verify: user.verify
      }
    }else{
      // Đăng kí tài khoản mới
      const password = randomPassword(); // mặc định 12 kí tự
      const data = await this.regiter({
        name: userInfor.name,
        email: userInfor.email,
        password,
        confirm_password: password,
        date_of_birth: new Date().toISOString()
      })
      return {
        ...data,
        newUser: 1,
        verify: UserVerifyStatus.Unverified
      }
    }
  }

  // Logout
  async logout(refresh_token: string){
    return await databaseService.refreshTokens.deleteOne({token: refresh_token})
  }

  // refreshToken
  async refreshToken({user_id, verify, refresh_token, exp} : {user_id: string, verify: UserVerifyStatus, refresh_token: string, exp: number}){
    const [new_access_token, new_refresh_token] = await Promise.all([
      this.signAccessToken({user_id, verify}),
      this.signRefreshToken({user_id, verify, exp}),
      databaseService.refreshTokens.deleteOne({token: refresh_token})
    ])
    await databaseService.refreshTokens.insertOne(new RefreshToken({token: new_refresh_token, user_id: new ObjectId(user_id)}))
    return {
      access_token: new_access_token,
      refresh_token: new_refresh_token
    }
  }

  // verifyEmail
  async verifyEmail(user_id: string){
    const [token] = await Promise.all([
        this.signAccessTokenAndRefreshToken({user_id, verify: UserVerifyStatus.Verified}),
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
    await databaseService.refreshTokens.insertOne(new RefreshToken({token: refresh_token, user_id: new ObjectId(user_id)}))

    return {
      access_token,
      refresh_token
    }
  }

  // resendVerifyEmail
  async resendVerifyEmail(user_id: string){
    // Tạo mới token + thay thế token cũ 
    const email_verify_token = await this.signEmailVerifyToken({user_id, verify: UserVerifyStatus.Unverified});
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
  async forgotPassword({user_id, verify}:{user_id: string, verify: UserVerifyStatus}){
    const forgot_password_token = await this.signForgotPasswordToken({user_id, verify})
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

  //get my profile
  async getMe(user_id: string){
    const user = await databaseService.users.findOne(
      {_id: new ObjectId(user_id)},
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
    return(
      user
    )
  }

  //update me
  async updateMe(user_id: string, payload: UpdateMeReqBody){
    const _payload = payload.date_of_birth? {...payload, date_of_birth: new Date(payload.date_of_birth)} : payload

    const user = await databaseService.users.findOneAndUpdate(
      {_id: new ObjectId(user_id)},
      {
        $set: {
          ...(_payload as UpdateMeReqBody & {date_of_birth?: Date})
        },
        $currentDate: {
          updated_at: true
        }
      },{
        returnDocument: "after",
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
    // console.log(user)
    return user
  }

  // follow
  async follow(user_id: string, followed_user_id: string){
    const followed = await databaseService.followers.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })

    if(followed === null){
      await databaseService.followers.insertOne(new Follower({
        user_id: new ObjectId(user_id),
        followed_user_id: new ObjectId(followed_user_id)
      }))
      return {
        message : USER_MESSAGE.FOLLOW_SUCCESS
      }
    }
    return{
      message : USER_MESSAGE.FOLLOWED_USER
    }
  }

  //unfollow
  async unfollow(user_id: string, unfollowed_user_id: string){
    const followed = await databaseService.followers.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(unfollowed_user_id)
    })

    if(followed){
      await databaseService.followers.deleteOne({
        _id: followed._id
      })
      return {
        message: USER_MESSAGE.UNFOLLOW_SUCCESS
      }
    }
    return{
      message : USER_MESSAGE.USER_NOT_FOUND
    }
  }

  // change password
  async changePassword(user_id: string, new_password: string){
    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          password: hashPassword(new_password)
        },
        $currentDate: {
          updated_at: true
        }
      }
    )

    return {
      message: USER_MESSAGE.CHANGE_PASSWORD_SUCCESS
    }
  }
}



const usersServices = new UsersServices;
export default usersServices