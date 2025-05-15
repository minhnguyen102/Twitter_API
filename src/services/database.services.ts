import  { Collection, Db, MongoClient } from 'mongodb';
import dotenv from 'dotenv'
import User from '~/models/schemas/User.schema';
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

  // Lấy ra Collection User
  get users(): Collection<User>{
    return this.db.collection(process.env.DB_USERS_COLLECTION as string); // fix lỗi string or undefined
  }
}

const databaseService = new DatabaseService()
export default databaseService


// Mục đích của file này chỉ để lấy ra collection từ bên mongodb