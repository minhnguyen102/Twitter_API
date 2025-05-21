import User from "~/models/schemas/User.schema";
import databaseService from "./database.services";
import { RegisterReqBody } from "~/models/requests/User.requests";
import { hashPassword } from "~/utils/crypto";
import { signToken } from "~/utils/jwt";
import { TokenType } from "~/constants/enums";
import { ObjectId } from "mongodb";
import RefreshToken from "~/models/schemas/RefreshToken.schema";


class UsersServices {
  private signAccessToken(user_id: string){
    return signToken({
      payload: {
        user_id,
        type: TokenType.AccessToken
      },
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
      options: {
        expiresIn: '100d'
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
    const user = await databaseService.users.insertOne(new User({
      ...payload,
      date_od_birth: new Date(payload.date_of_birth),
      password: hashPassword(payload.password)
      // vì trong interface RegisterReqBody date_of_bỉrth là kiểu string, cần convert lại kiểu Date để hợp với hàm tạo trong class User
    }))

    const user_id = user.insertedId.toString();
    const [accessToken, refreshToken] = await this.signAccessTokenAndRefreshToken(user_id)
    await databaseService.refreshTokens.insertOne(new RefreshToken({token: refreshToken, user_id: new ObjectId(user_id)}))
    return {
      accessToken,
      refreshToken
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
}

const usersServices = new UsersServices;
export default usersServices