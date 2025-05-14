import  { MongoClient } from 'mongodb';
import dotenv from 'dotenv'
dotenv.config()

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.PASSWORD}@cluster0.sqjfe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

class DatabaseService {
  private client: MongoClient
  constructor(){
    this.client = new MongoClient(uri);
  }

  async run() {
    try {
      // Send a ping to confirm a successful connection
      await this.client.db("admin").command({ ping: 1 });
      console.log("Connect Success");
    } finally {
      // Ensures that the client will close when you finish/error
      await this.client.close();
    }
  }
}

const databaseService = new DatabaseService()
export default databaseService
