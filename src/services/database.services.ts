import  { Collection, Db, MongoClient } from 'mongodb';
import dotenv from 'dotenv'
import User from '~/models/schemas/User.schema';
import RefreshToken from '~/models/schemas/RefreshToken.schema';
import Follower from '~/models/schemas/Follower.schema';
import Tweet from '~/models/schemas/Tweet.schema';
import Hashtag from '~/models/schemas/Hashtag.schema';
import Bookmark from '~/models/schemas/Bookmark.schema';
dotenv.config()

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.PASSWORD}@cluster0.sqjfe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

class DatabaseService {
  private client: MongoClient
  private db: Db 
  constructor(){
    this.client = new MongoClient(uri);
    this.db = this.client.db(process.env.DB_NAME)
  }

  async run() {
    try {
      // Send a ping to confirm a successful connection
      await this.db.command({ ping: 1 });
      console.log("Connect Success");
    }catch(error){
      console.log(error)
      throw error
    }
  }

  async createIndexUser(){
    const indexExit = await this.users.indexExists(['email_1_password_1', 'email_1', 'username_1'])
    if(!indexExit){
      this.users.createIndex({email: 1, password: 1}),
      this.users.createIndex({email:  1}, {unique: true})
      this.users.createIndex({username:  1}, {unique: true})
    }
  }

  async createIndexRefreshToken(){
    const indexExit = await this.refreshTokens.indexExists(['token_1'])
    if(!indexExit){
      this.refreshTokens.createIndex({token: 1})
      this.refreshTokens.createIndex({exp: 1}, {expireAfterSeconds: 0})
    }
  }

  async createIndexFollower(){
    const indexExit = await this.followers.indexExists(['user_id_1_followed_user_id_1'])
    if(!indexExit){
      this.followers.createIndex({user_id: 1, followed_user_id: 1})
    }
  }

  // Lấy ra Collection User
  get users(): Collection<User>{
    return this.db.collection(process.env.DB_USERS_COLLECTION as string); // fix lỗi string or undefined
  }

  // lấy ra Collections RefreshToken
  get refreshTokens(): Collection<RefreshToken>{
    return this.db.collection(process.env.DB_REFRESH_TOKENS_COLLECTION as string)
  }

  // lấy ra Collection Follower
  get followers(): Collection<Follower>{
    return this.db.collection(process.env.DB_FOLLOWERS_COLLECTION as string)
  }

  // lấy ra Collection Tweet
  get tweets(): Collection<Tweet>{
    return this.db.collection(process.env.DB_TWEETS_COLLECTION as string)
  }

  // lấy ra Collection Hashtag
  get hashtags(): Collection<Hashtag>{
    return this.db.collection(process.env.DB_HASHTAGS_COLLECTION as string)
  }

  // lấy ra Collection Bookmark
  get bookmarks(): Collection<Bookmark>{
    return this.db.collection(process.env.DB_BOOKMARKS_COLLECTION as string)
  }
}

const databaseService = new DatabaseService()
export default databaseService


// Mục đích của file này chỉ để lấy ra collection từ bên mongodb