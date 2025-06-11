import { checkSchema } from "express-validator";
import { ObjectId } from "mongodb";
import httpStatus from "~/constants/httpStatus";
import { BOOKMARK_MESSAGE, USER_MESSAGE } from "~/constants/messages";
import { ErrorWithStatus } from "~/models/Errors";
import databaseService from "~/services/database.services";
import { validate } from "~/utils/validation";
import { Request, Response, NextFunction } from "express";
import Tweet from "~/models/schemas/Tweet.schema";
import { TweetAudience, UserVerifyStatus } from "~/constants/enums";
import { TokenPayload } from "~/models/requests/User.requests";
import User from "~/models/schemas/User.schema";

export const validateTweetId = validate(
  checkSchema({
    tweet_id: {
      custom: {
        options: async(value, { req }) => {
          if(!ObjectId.isValid(value)){
            throw new ErrorWithStatus({
              status: httpStatus.BAD_REQUEST,
              message: BOOKMARK_MESSAGE.TWEET_ID_IN_VALID
            })
          }
          const [tweet] = await databaseService.tweets.aggregate<Tweet>([
            {
              '$match': {
                '_id': new ObjectId('6847f9632447f7b76307a375')
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
                'as': 'bookmarks'
              }
            }, {
              '$addFields': {
                'bookmarks': {
                  '$size': '$bookmarks'
                }, 
                'retweet_count': {
                  '$size': {
                    '$filter': {
                      'input': '$tweet_children', 
                      'as': 'item', 
                      'cond': {
                        '$eq': [
                          '$$item.type', 1
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
                          '$$item.type', 2
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
                          '$$item.type', 3
                        ]
                      }
                    }
                  }
                }, 
                'views': {
                  '$add': [
                    '$user_views', '$guest_views'
                  ]
                }
              }
            }, {
              '$project': {
                'tweet_children': 0
              }
            }]
          ).toArray()
          if(!tweet){
            throw new ErrorWithStatus(
              {
                status: httpStatus.NOT_FOUND,
                message: BOOKMARK_MESSAGE.NOT_FOUND
              }
            )
          }
          (req as Request).tweet = tweet as Tweet
          return true
        }
      }
    }
  },['body', 'params'])
)

export const validateAudience = async (req: Request, res: Response, next: NextFunction) => {
  // kiểm tra audience của bài tweet nếu là TwiiterCircle thì check
  const tweet = req.tweet as Tweet
  if(tweet.audience === TweetAudience.TwiiterCircle){
    // kiểm tra người dùng đã đăng nhập hay chưa
    const {user_id} = req.decoded_authorization as TokenPayload
    if(!user_id){
      throw new ErrorWithStatus({
        message : USER_MESSAGE.ACCESS_TOKEN_IS_REQUIRED,
        status: httpStatus.UNAUTHORIZED
      })
    }
    // Kiểm tra tác giả có tồn tại và có bị banner không 
    const author_id = tweet.user_id 
    const author = await databaseService.users.findOne({_id: author_id}) as User
    if(!author || author.verify === UserVerifyStatus.Banner){
      throw new ErrorWithStatus({
        message : USER_MESSAGE.USER_IS_BANNER,
        status: httpStatus.NOT_FOUND
      })
    }
    // Kiểm tra xem người dùng có trong danh sách tweeter_circle hay không
    const isInTweeterCircle = author.tweeter_circle.some((user_circle_id) => user_circle_id.equals(user_id))
    if(!isInTweeterCircle && !author_id.equals(user_id)){
      throw new ErrorWithStatus({
        message : USER_MESSAGE.TWEET_IS_NOT_PUBLIC,
        status: httpStatus.FORBIDDEN
      })
    }
  }
  next()
}