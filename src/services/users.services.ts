import User from "~/models/schemas/User.schema";
import databaseService from "./database.services";
import { RegisterReqBody } from "~/models/requests/User.requests";

class UsersServices {
  async regiter(payload: RegisterReqBody){
    const user = await databaseService.users.insertOne(new User({
      ...payload,
      date_od_birth: new Date(payload.date_of_birth)
      // vì trong interface RegisterReqBody date_of_bỉrth là kiểu string, cần convert lại kiểu Date để hợp với hàm tạo trong class User
    }))

    return user;
  }

  async checkEmailExit(email: string){
    const emailExit = await databaseService.users.findOne({email});
    return Boolean(emailExit); // trả về true nếu email đã tồn tại
  }
}

const usersServices = new UsersServices;
export default usersServices