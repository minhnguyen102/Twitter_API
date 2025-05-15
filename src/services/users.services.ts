import User from "~/models/schemas/User.schema";
import databaseService from "./database.services";

class UsersServices {
  async regiter(payload: { email: string, password: string}){
    const {email, password} = payload;
    const user = await databaseService.users.insertOne(new User({
      email: email,
      password: password
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