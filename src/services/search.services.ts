import { ObjectId } from "mongodb"
import databaseService from "./database.services"
import { MediaType, MediaTypeQuery, TweetAudience, TweetType } from "~/constants/enums"

class SearchService{
  async search({content, limit, page, user_id, mediaType, peopleFollow} : {content: string, limit: number, page: number, user_id: string, mediaType?: MediaTypeQuery, peopleFollow?: string}){
    const $match: any = {
      '$text': {
        '$search': content
      }
    }
    // Query mediaType
    if(mediaType){
      if(mediaType === MediaTypeQuery.Image){
        $match['medias.type'] = MediaType.Image
      }else{
        $match['medias.type'] = {
          $in: [MediaType.HLS, MediaType.Video]
        }
      }
    }

    // Query peopleFollow
    if(peopleFollow && peopleFollow === 'true'){
      const follower_users = await databaseService.followers.find({
        user_id: new ObjectId(user_id)
      }).toArray()
      const follower_user_ids = follower_users.map(follower_user => follower_user.followed_user_id);
      // Thêm cả id của tôi để hiển thị bài của tôi trên new feed
      follower_user_ids.push(new ObjectId(user_id))
      $match['user_id'] = {
        '$in': follower_user_ids
      }
    }

    const [tweets, totalDocument] = await Promise.all([
    databaseService.tweets.aggregate(
      [
        {
          '$match': $match
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
          '$skip': limit * (page -1)
        }, {
          '$limit': limit
        }
      ]
    ).toArray(),
    databaseService.tweets.aggregate([
        {
          '$match': $match
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
    return {
      tweets, 
      totalDocument: totalDocument[0]?.total || 0
    }
  }
}

const searchService = new SearchService()
export default searchService