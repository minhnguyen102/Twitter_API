import { ObjectId } from "mongodb"
import databaseService from "./database.services"
import { TweetAudience, TweetType } from "~/constants/enums"

class SearchService{
  async search({content, limit, page, user_id} : {content: string, limit: number, page: number, user_id: string}){
    const [tweets, totalDocument] = await Promise.all([
      databaseService.tweets.aggregate(
      [
        {
          '$match': {
            '$text': {
              '$search': content
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
        }, {
          '$match': {
            '$or': [
              {
                'audience': TweetAudience.Everyone
              }, {
                '$and': [
                  {
                    'audience': TweetAudience.TwiiterCircle
                  }, {
                    'user.tweeter_circle': {
                      '$in': [
                        new ObjectId(user_id)
                      ]
                    }
                  }
                ]
              }, {
                'user_id': new ObjectId(user_id)
              }
            ]
          }
        }, {
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
        }, {
          '$skip': page * (limit -1)
        }, {
          '$limit': limit
        }
      ]
    ).toArray(),
    await databaseService.tweets.aggregate([
        {
          '$match': {
            '$text': {
              '$search': content
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
      ]).toArray()

    ]) 
    // console.log(totalDocument)
    return {tweets, totalDocument}
  }
}

const searchService = new SearchService()
export default searchService