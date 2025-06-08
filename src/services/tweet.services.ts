import { TweetReqBody } from "~/models/requests/Tweet.requets";
import databaseService from "./database.services";
import { ObjectId } from "mongodb";
import Tweet from "~/models/schemas/Tweet.schema";

class TweetService{
  async createTweet(user_id: string ,body: TweetReqBody) {
    const result = await databaseService.tweets.insertOne(new Tweet({
      type: body.type,
      audience: body.audience,
      parent_id: body.parent_id,
      content: body.content,
      hashtags: [],
      mentions: body.mentions,
      medias: body.medias,
      user_id: new ObjectId(user_id)
    }))
    const tweet = await databaseService.tweets.findOne({
      _id : result.insertedId
    })
    return tweet
  }
}

const tweetService = new TweetService()

export default tweetService