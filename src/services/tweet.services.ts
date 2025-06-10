import { TweetReqBody } from "~/models/requests/Tweet.requets";
import databaseService from "./database.services";
import { ObjectId, WithId } from "mongodb";
import Tweet from "~/models/schemas/Tweet.schema";
import Hashtag from "~/models/schemas/Hashtag.schema";
import { hash } from "crypto";

class TweetService{
  async findOrCreateHashtag(hashtags: string[]){
    const hashtagsDocument = await Promise.all(hashtags.map((hashtag) => {
      return databaseService.hashtags.findOneAndUpdate(
        {name: hashtag},
        {
          $setOnInsert: new Hashtag({name: hashtag})
        },
        {
          upsert: true,
          returnDocument: "after"
        }
      )
    }))
    return hashtagsDocument.map(hashtag => {
      return (hashtag as WithId<Hashtag>)._id
    })
  }
  async createTweet(user_id: string ,body: TweetReqBody) {
    const hashtags = await this.findOrCreateHashtag(body.hashtags)
    const result = await databaseService.tweets.insertOne(new Tweet({
      type: body.type,
      audience: body.audience,
      parent_id: body.parent_id,
      content: body.content,
      hashtags,
      mentions: body.mentions,
      medias: body.medias,
      user_id: new ObjectId(user_id)
    }))
    const tweet = await databaseService.tweets.findOne({
      _id : result.insertedId
    })
    return tweet
  }
  async detailTweet(tweet_id: string){
    const tweet = await databaseService.tweets.findOne({_id: new ObjectId(tweet_id)})
    return tweet
  }
}

const tweetService = new TweetService()

export default tweetService