import { ObjectId } from "mongodb";
import { UserVerifyStatus } from "~/constants/enums";

interface UserType{
  _id?: ObjectId,
  name: string,
  email: string,
  password: string,
  date_od_birth: Date,
  created_at?: Date,
  updated_at?: Date,
  email_verify_token?: string, //jwt hoặc '' nếu đã xác thực email
  forgot_password_token?: string, // jwt hoặc '' nếu đã xác thực email
  verify?: UserVerifyStatus

  tweeter_circle?: ObjectId[]
  bio?: string, //optional
  location?: string, //optional
  website?: string, //optional
  username?: string, //optional
  avatar?: string, //optional
  cover_photo?: string //optional
}



export default class User{
  _id?: ObjectId
  email: string
  name: string
  password: string
  date_od_birth: Date
  created_at: Date
  updated_at: Date
  email_verify_token: string
  forgot_password_token: string
  verify: UserVerifyStatus

  tweeter_circle: ObjectId[]
  bio: string
  location: string
  website: string 
  username: string 
  avatar: string 
  cover_photo: string 

  constructor(user : UserType){
    const date = new Date()
    this._id = user._id || new ObjectId()
    this.name = user.name || ''
    this.email = user.email
    this.password = user.password
    this.date_od_birth = user.date_od_birth || new Date()
    this.created_at = user.created_at || date
    this.updated_at = user.updated_at || date
    this.email_verify_token = user.email_verify_token || ''
    this.forgot_password_token = user.forgot_password_token || ''
    this.verify = user.verify || UserVerifyStatus.Unverified
    this.tweeter_circle = user.tweeter_circle || []
    this.bio = user.bio || ''
    this.location = user.location || ''
    this.website = user.website || ''
    this.username = user.username || ''
    this.avatar = user.avatar || ''
    this.cover_photo = user.cover_photo || ''
  }
}