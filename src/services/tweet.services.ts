import { TweetReqBody } from "~/models/requests/Tweet.requets";
import databaseService from "./database.services";
import { ObjectId, WithId } from "mongodb";
import Tweet from "~/models/schemas/Tweet.schema";
import Hashtag from "~/models/schemas/Hashtag.schema";
import { hash } from "crypto";
import { TweetType } from "~/constants/enums";

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

  async increaseView(tweet_id: string, user_id?: string){
    const views = user_id? {user_views: 1} : {guest_views : 1}
    const result = await databaseService.tweets.findOneAndUpdate(
      {
        _id: new ObjectId(tweet_id)
      },
      {
        $inc: views
      },
      {
        returnDocument: "after",
        projection: {
          user_views: 1,
          guest_views: 1
        }
      }
    )
    return result as WithId<{
      user_views: number,
      guest_views: number
    }>
  }

  async getDetailTweetChildren({tweet_id, type, limit, page} : {tweet_id: string, type: TweetType, limit: number, page: number}){
    const tweetDetailChildren = await databaseService.tweets.aggregate(
      [
        {
          '$match': {
            'parent_id': new ObjectId(tweet_id), 
            'type': type
          }
        }, {
          '$lookup': {
            'from': 'tweets', 
            'localField': '_id', 
            'foreignField': 'parent_id', 
            'as': 'tweet_children'
          }
        }, {
          '$lookup': {
            'from': 'bookmarks', 
            'localField': '_id', 
            'foreignField': 'tweet_id', 
            'as': 'results'
          }
        }, {
          '$addFields': {
            'retweet_count': {
              '$size': {
                '$filter': {
                  'input': '$tweet_children', 
                  'as': 'item', 
                  'cond': {
                    '$eq': [
                      '$$item.type', TweetType.Retweet
                    ]
                  }
                }
              }
            }, 
            'commnent_count': {
              '$size': {
                '$filter': {
                  'input': '$tweet_children', 
                  'as': 'item', 
                  'cond': {
                    '$eq': [
                      '$$item.type', TweetType.Comment
                    ]
                  }
                }
              }
            }, 
            'quote_count': {
              '$size': {
                '$filter': {
                  'input': '$tweet_children', 
                  'as': 'item', 
                  'cond': {
                    '$eq': [
                      '$$item.type', TweetType.QuoteTweet
                    ]
                  }
                }
              }
            }
          }
        }, {
          '$addFields': {
            'views': {
              '$add': [
                '$user_views', '$guest_views'
              ]
            }
          }
        }, {
          '$project': {
            'result': 0, 
            'tweet_children': 0
          }
        }, {
          '$skip': limit * (page - 1)
        }, {
          '$limit': limit
        }
      ]
    ).toArray()
    const totalDocument = await databaseService.tweets.countDocuments({
      'parent_id': new ObjectId(tweet_id), 
      'type': type
    })
    return {tweetDetailChildren, totalDocument}
  }
}

const tweetService = new TweetService()

export default tweetService