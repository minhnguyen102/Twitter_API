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
        $inc: views,
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: "after",
        projection: {
          user_views: 1,
          guest_views: 1,
          updated_at: 1
        }
      }
    )
    return result as WithId<{
      user_views: number,
      guest_views: number,
      updated_at: Date
    }>
  }

  async getDetailTweetChildren({tweet_id, type, limit, page, user_id} : {tweet_id: string, type: TweetType, limit: number, page: number, user_id?: string}){
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
        }, 
        {
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
    // pagination and increase views
    const tweet_children_ids = tweetDetailChildren.map(tweet => tweet._id)
    const inc = user_id? {user_views: 1} : {guest_views: 1}
    const date = new Date
    const [, totalDocument] = await Promise.all([
      databaseService.tweets.updateMany(
        {
          _id: {
            $in: tweet_children_ids
          }
        }, {
          $inc: inc,
          $set: {
            updated_at: date
          }
        }
      ),
      await databaseService.tweets.countDocuments({
        'parent_id': new ObjectId(tweet_id), 
        'type': type
      })
    ])
    tweetDetailChildren.forEach(tweet => {
      tweet.updated_at= date
      if(user_id){
        tweet.user_views += 1 // không cộng trực tiếp trong db, để đảm bảo kết quả trả về là đúng
      }else{
        tweet.guest_views += 1
      }
    })
    return {tweetDetailChildren, totalDocument}
  }

  async getNewFeeds({user_id, limit, page} : {user_id: string, limit: number, page: number}){
    const follower_users = await databaseService.followers.find({
      user_id: new ObjectId(user_id)
    }).toArray()
    const follower_user_ids = follower_users.map(follower_user => follower_user.followed_user_id);
    // Thêm cả id của tôi để hiển thị bài của tôi trên new feed
    follower_user_ids.push(new ObjectId(user_id))
    // console.log("follower_user_ids and my id total: ", follower_user_ids.length)
    const [newFeeds, totalDocument] = await Promise.all([databaseService.tweets.aggregate(
      [
        {
          '$match': {
            'user_id': {
              '$in': follower_user_ids
            }
          }
        }, {
          '$lookup': {
            'from': 'users', 
            'localField': 'user_id', 
            'foreignField': '_id', 
            'as': 'user'
          }
        }, {
          '$unwind': {
            'path': '$user'
          }
        }, 
        {
          '$match': {
            '$or': [
              {
                'audience': 0
              }, {
                '$and': [
                  {
                    'audience': 1
                  }, {
                    'user.tweeter_circle': {
                      '$in': [
                        new ObjectId(user_id) // trong audience: TweetCircle của người tôi follow phải có id của tôi
                      ]
                    }
                  }
                ]
              }, 
              {
                'user_id': new ObjectId(user_id) // hoặc bài viết này phải là của tôi
              }
            ]
          }
        },
        {
          '$skip': limit * (page - 1)
        }, {
          '$limit': limit
        }, 
        {
          '$lookup': {
            'from': 'hashtags', 
            'localField': 'hashtags', 
            'foreignField': '_id', 
            'as': 'hashtags'
          }
        }, {
          '$lookup': {
            'from': 'mentions', 
            'localField': 'mentions', 
            'foreignField': '_id', 
            'as': 'mentions'
          }
        }, {
          '$addFields': {
            'mentions': {
              '$map': {
                'input': '$mentions', 
                'as': 'mention', 
                'in': {
                  '_id': '$$mention._id', 
                  'name': '$$mention.name', 
                  'username': '$$mention.username', 
                  'email': '$$mention.email'
                }
              }
            }
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
            'results': 0, 
            'tweet_children': 0, 
            'user': {
              'password': 0, 
              'email_verify_token': 0, 
              'forgot_password_token': 0, 
              'tweeter_circle': 0, 
              'date_od_birth': 0
            }
          }
        }
      ]
    ).toArray(), await databaseService.tweets.aggregate([
        {
          '$match': {
            'user_id': {
              '$in': follower_user_ids
            }
          }
        }, {
          '$lookup': {
            'from': 'users', 
            'localField': 'user_id', 
            'foreignField': '_id', 
            'as': 'user'
          }
        }, {
          '$unwind': {
            'path': '$user'
          }
        }, 
        {
          '$match': {
            '$or': [
              {
                'audience': 0
              }, {
                '$and': [
                  {
                    'audience': 1
                  }, {
                    'user.tweeter_circle': {
                      '$in': [
                        new ObjectId(user_id) // trong audience: TweetCircle của người tôi follow phải có id của tôi
                      ]
                    }
                  }
                ]
              }, 
              {
                'user_id': new ObjectId(user_id) // hoặc bài viết này phải là của tôi
              }
            ]
          }
        },{
          '$count': "total"
        }
      ]).toArray()]) // trả về 1 mảng new feeds

    // pagination and increase views
    const newFeed_ids = newFeeds.map(newFeed => newFeed._id);
    const date = new Date
    await databaseService.tweets.updateMany(
        {
          _id: {
            $in: newFeed_ids
          }
        }, {
          $inc: {user_views: 1},
          $set: {
            updated_at: date
          }
        }
      )
    newFeeds.forEach(newFeeds => {
      newFeeds.updated_at= date
      newFeeds.user_views += 1 
    })

    return {newFeeds, totalDocument}
  }
}

const tweetService = new TweetService()

export default tweetService